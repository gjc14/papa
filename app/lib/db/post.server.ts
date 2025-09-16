import { eq, inArray, sql } from 'drizzle-orm'

import { db, type TransactionType } from '~/lib/db/db.server'
import type { Category, Post, Seo, Tag } from '~/lib/db/schema'
import {
	category as categoryTable,
	PostStatus,
	post as postTable,
	postToCategory,
	postToTag,
	seo as seoTable,
	tag as tagTable,
	user,
} from '~/lib/db/schema'

import { convertDateFields, snakeToCamel } from './utils'

type User = typeof user.$inferSelect

export type PostWithRelations = Post & {
	seo: Seo
	tags: Tag[]
	categories: Category[]
	author: User | null
}

/**
 * Get posts with optional filters.
 * @param props - The filters to apply when fetching posts.
 * @returns The posts that match the filters.
 */
export const getPosts = async (
	props: {
		status?: PostStatus | 'ALL'
		categories?: string[]
		tags?: string[]
		title?: string
	} = {},
): Promise<{
	posts: PostWithRelations[]
	categoryFilter?: Category[]
	tagFilter?: Tag[]
}> => {
	const {
		status = 'PUBLISHED',
		categories: categorySlugs = [],
		tags: tagSlugs = [],
		title,
	} = props

	const [postData, tagsData, categoriesData] = await Promise.all([
		db.execute(sql`
		SELECT DISTINCT ON (p.id)
			p.*,
			row_to_json(u) AS author,
			row_to_json(s) AS seo,
			COALESCE(
				(
					SELECT json_agg(row_to_json(t))
					FROM ${postToTag} pt
					JOIN ${tagTable} t ON pt.tag_id = t.id
					WHERE pt.post_id = p.id
				),
				'[]'::json
			) AS tags,
			COALESCE(
				(
					SELECT json_agg(row_to_json(c))
					FROM ${postToCategory} pc
					JOIN ${categoryTable} c ON pc.category_id = c.id
					WHERE pc.post_id = p.id
				),
				'[]'::json
			) AS categories
		FROM ${postTable} p
		LEFT JOIN ${postToTag} pt ON p.id = pt.post_id
		LEFT JOIN ${tagTable} t ON pt.tag_id = t.id
		LEFT JOIN ${postToCategory} pc ON p.id = pc.post_id
		LEFT JOIN ${categoryTable} c ON pc.category_id = c.id
		LEFT JOIN ${user} u ON p.author_id = u.id
		LEFT JOIN ${seoTable} s ON p.id = s.post_id
		WHERE (
			${status !== 'ALL' ? sql`p.status = ${status}` : sql`TRUE`}
			AND (${title ? sql`p.title ILIKE ${'%' + title + '%'}` : sql`TRUE`})
			AND (${
				tagSlugs.length > 0
					? sql`t.slug = ANY(ARRAY[${sql.join(
							tagSlugs.map(s => sql`${s}`),
							sql`, `,
						)}])`
					: sql`TRUE`
			})
			AND (${
				categorySlugs.length > 0
					? sql`c.slug = ANY(ARRAY[${sql.join(
							categorySlugs.map(s => sql`${s}`),
							sql`, `,
						)}])`
					: sql`TRUE`
			})
			-- more conditions
		)
	`),
		tagSlugs.length > 0
			? db.execute(sql`
						SELECT *
						FROM ${tagTable}
						WHERE ${tagTable.slug} = ANY(ARRAY[${sql.join(
							tagSlugs.map(s => sql`${s}`),
							sql`, `,
						)}])
					`)
			: { rows: [] },
		categorySlugs.length > 0
			? db.execute(sql`
						SELECT *
						FROM ${categoryTable}
						WHERE ${categoryTable.slug} = ANY(ARRAY[${sql.join(
							categorySlugs.map(s => sql`${s}`),
							sql`, `,
						)}])
					`)
			: { rows: [] },
	])

	return {
		posts: convertDateFields(
			snakeToCamel(postData.rows),
		) as PostWithRelations[],
		tagFilter: tagsData.rows as Tag[],
		categoryFilter: categoriesData.rows as Category[],
	}
}

export const getPostIdsByTagSlugs = async (
	tagSlugs: string[],
): Promise<{ tagsWithPostIds: typeof tagsWithPostIds; postIds: number[] }> => {
	const tagsWithPostIds = await db.query.tag.findMany({
		where: (tags, { inArray }) => inArray(tags.slug, tagSlugs),
		with: {
			postToTag: {
				columns: {
					postId: true,
				},
			},
		},
	})
	const filteredPostIds = tagsWithPostIds.flatMap(t =>
		t.postToTag.flatMap(t => t.postId),
	)
	return { tagsWithPostIds, postIds: filteredPostIds }
}

export const getPostIdsByCategorySlugs = async (
	categorySlugs: string[],
): Promise<{
	categoriessWithPostIds: typeof catsWithPostIds
	postIds: number[]
}> => {
	const catsWithPostIds = await db.query.category.findMany({
		where: (cats, { inArray }) => inArray(cats.slug, categorySlugs),
		with: {
			postToCategory: {
				columns: {
					postId: true,
				},
			},
		},
	})
	const filteredPostIds = catsWithPostIds.flatMap(t =>
		t.postToCategory.flatMap(t => t.postId),
	)
	return { categoriessWithPostIds: catsWithPostIds, postIds: filteredPostIds }
}

export const getPostsByAuthor = async (
	authorId: string,
): Promise<{ posts: typeof posts }> => {
	const posts = await db.query.post.findMany({
		where: (post, { eq }) => eq(post.authorId, authorId),
		with: {
			postToTag: {
				columns: {
					postId: true,
				},
			},
		},
	})

	return { posts }
}

export const getPost = async (
	id: number,
): Promise<{ post: PostWithRelations | null }> => {
	const postRaw = await db.query.post.findFirst({
		where: (t, { eq }) => eq(t.id, id),
		with: {
			author: true,
			seo: true,
			postToTag: {
				with: {
					tag: true,
				},
			},
			postToCategory: {
				with: {
					category: true,
				},
			},
		},
	})

	const post = postRaw
		? {
				...postRaw,
				tags: postRaw.postToTag.map(association => association.tag),
				categories: postRaw.postToCategory.map(
					association => association.category,
				),
			}
		: null

	return { post }
}

export const getPostBySlug = async (
	slug: string,
	status: PostStatus | 'EDIT' = 'PUBLISHED',
): Promise<{
	post: PostWithRelations | null
	prevPost: Pick<PostWithRelations, 'slug' | 'title'> | null
	nextPost: Pick<PostWithRelations, 'slug' | 'title'> | null
}> => {
	const postResult = await db.execute(sql`
		-- create window (extend post) with prev_id & next_id columns
		-- | * | prev_id | next_id |
		WITH ordered_posts AS (
			SELECT
				*,
				LAG(p.id) OVER (ORDER BY p.updated_at) AS prev_id,
				LEAD(p.id) OVER (ORDER BY p.updated_at) AS next_id
			FROM ${postTable} p
			WHERE ${status === 'EDIT' ? sql`TRUE` : sql`p.status = ${status}`}
			ORDER BY p.updated_at
		)

		SELECT
			op.*,
			prev_p.title AS prev_title,
			prev_p.slug AS prev_slug,
			next_p.title AS next_title,
			next_p.slug AS next_slug,
			-- Select author, seo, tags, categories as JSON
			row_to_json(u) AS author,
			row_to_json(s) AS seo,

			-- Use coalesce to assign '[]',
			-- making sure that it returns:
			--  { tags: [], categories: [] } instead of { tags: null, categories: null }
			COALESCE(
				(
					SELECT json_agg(t)
					FROM ${postToTag} pt
					LEFT JOIN ${tagTable} t ON pt.tag_id = t.id
					WHERE pt.post_id = op.id
				),
				'[]'::json
			) AS tags,
			COALESCE(
				(
					SELECT json_agg(c)
					FROM ${postToCategory} pc
					LEFT JOIN ${categoryTable} c ON pc.category_id = c.id
					WHERE pc.post_id = op.id
				),
				'[]'::json
			) AS categories
		-- From the windowed posts
		FROM ordered_posts op
		LEFT JOIN ${postTable} AS prev_p ON op.prev_id = prev_p.id
		LEFT JOIN ${postTable} AS next_p ON op.next_id = next_p.id
		-- JOIN author, seo
		LEFT JOIN ${user} u ON op.author_id = u.id
		LEFT JOIN ${seoTable} s ON op.id = s.post_id

		WHERE op.slug = ${slug}
    `)

	if (postResult.rowCount !== 1) {
		return { post: null, prevPost: null, nextPost: null }
	}

	const createAdjacentPost = (
		title: string | null,
		slug: string | null,
	): Pick<PostWithRelations, 'slug' | 'title'> | null => {
		return title && slug ? { title, slug } : null
	}

	const camelPost = convertDateFields(
		snakeToCamel(postResult.rows[0]),
	) as PostWithRelations & {
		prevTitle: PostWithRelations['title']
		prevSlug: PostWithRelations['slug']
		nextTitle: PostWithRelations['title']
		nextSlug: PostWithRelations['slug']
	}

	return {
		post: camelPost,
		prevPost: createAdjacentPost(camelPost.prevTitle, camelPost.prevSlug),
		nextPost: createAdjacentPost(camelPost.nextTitle, camelPost.nextSlug),
	}
}

type CreatePostProps = Omit<
	typeof postTable.$inferInsert,
	'id' | 'createdAt' | 'updatedAt'
> & {
	tags: (typeof tagTable.$inferSelect)[]
	categories: (typeof categoryTable.$inferSelect)[]
} & {
	seo: Pick<Seo, 'metaDescription' | 'metaTitle'>
}

export const createPost = async (
	props: CreatePostProps,
): Promise<{ post: PostWithRelations }> => {
	const {
		authorId,
		title,
		content,
		slug,
		excerpt,
		status,
		featuredImage,
		tags,
		categories,
		seo,
	} = props

	const post = await db.transaction(async tx => {
		const [postCreated] = await tx
			.insert(postTable)
			.values({
				authorId: authorId,
				title: title,
				content: content,
				slug: slug,
				excerpt: excerpt,
				status: status,
				featuredImage: featuredImage,
			})
			.returning()

		const author = authorId
			? ((await tx.query.user.findFirst({
					where: (users, { eq }) => eq(users.id, authorId),
				})) ?? null)
			: null

		const [seoCreated] = await tx
			.insert(seoTable)
			.values({
				metaTitle: seo.metaTitle || title,
				metaDescription: seo.metaDescription || excerpt || '',
				autoGenerated: true,
				postId: postCreated.id,
				route: '/blog/' + slug,
			})
			.returning()

		const tagsRelated = await processTaxonomyTags(tx, tags, postCreated.id)
		const categoriesRelated = await processTaxonomyCategories(
			tx,
			categories,
			postCreated.id,
		)

		return {
			...postCreated,
			author,
			seo: seoCreated,
			tags: tagsRelated,
			categories: categoriesRelated,
		}
	})

	return { post }
}

interface UpdatePostProps extends CreatePostProps {
	id: number
}

export const updatePost = async (
	props: UpdatePostProps,
): Promise<{ post: PostWithRelations }> => {
	const {
		id,
		authorId,
		title,
		content,
		slug,
		excerpt,
		status,
		featuredImage,
		tags,
		categories,
		seo,
	} = props

	const post = await db.transaction(async tx => {
		const [postUpdated] = await tx
			.update(postTable)
			.set({
				authorId: authorId,
				title: title,
				content: content,
				slug: slug,
				excerpt: excerpt,
				status: status,
				featuredImage: featuredImage,
			})
			.where(eq(postTable.id, id))
			.returning()

		const author = authorId
			? ((await tx.query.user.findFirst({
					where: (users, { eq }) => eq(users.id, authorId),
				})) ?? null)
			: null

		const [seoUpdated] = await tx
			.update(seoTable)
			.set({
				metaTitle: seo.metaTitle || title,
				metaDescription: seo.metaDescription || '',
				route: '/blog/' + slug,
			})
			.where(eq(seoTable.postId, id))
			.returning()

		const tagsRelated = await processTaxonomyTags(tx, tags, id)
		const categoriesRelated = await processTaxonomyCategories(
			tx,
			categories,
			id,
		)

		return {
			...postUpdated,
			author,
			seo: seoUpdated,
			tags: tagsRelated,
			categories: categoriesRelated,
		}
	})

	return { post }
}

export const deletePost = async (id: number): Promise<{ post: Post }> => {
	const [post] = await db
		.delete(postTable)
		.where(eq(postTable.id, id))
		.returning()
	return { post }
}

export const processTaxonomyTags = async (
	tx: TransactionType,
	tags: Tag[],
	postId: number,
): Promise<Tag[]> => {
	// New tags are negative IDs
	const existingTags = tags.filter(tag => tag.id > 0)
	const newTags = tags.filter(tag => tag.id < 0)

	// Check if names are unique
	const newTagNames = newTags.map(tag => tag.name)
	const existingNewTags = await tx
		.select()
		.from(tagTable)
		.where(inArray(tagTable.name, newTagNames))

	// Filter tags that with name already exist
	const tagsToInsert = newTags.filter(
		newTag => !existingNewTags.some(tag => tag.name === newTag.name),
	)

	// Insert new tags
	let insertedTags: Tag[] = []
	if (tagsToInsert.length > 0) {
		insertedTags = await tx
			.insert(tagTable)
			.values(
				tagsToInsert.map(tag => ({
					name: tag.name,
					slug: tag.slug,
					description: tag.description,
				})),
			)
			.returning()
	}

	// Combine existing new tags and newly created tags
	const createdTagIds = [
		...existingNewTags.map(tag => tag.id),
		...insertedTags.map(tag => tag.id),
	]

	const allTagIds = [...existingTags.map(tag => tag.id), ...createdTagIds]

	// Clear existing relations
	await tx.delete(postToTag).where(eq(postToTag.postId, postId))

	// Create new relations
	if (allTagIds.length > 0) {
		await tx.insert(postToTag).values(
			allTagIds.map(tagId => ({
				postId: postId,
				tagId: tagId,
			})),
		)

		return await tx
			.select()
			.from(tagTable)
			.where(inArray(tagTable.id, allTagIds))
	}

	return []
}

export const processTaxonomyCategories = async (
	tx: TransactionType,
	categories: Category[],
	postId: number,
): Promise<Category[]> => {
	// New categories are negative IDs
	const existingCats = categories.filter(cat => cat.id > 0)
	const newCategories = categories.filter(cat => cat.id < 0)

	// Check if names are unique
	const newCatNames = newCategories.map(cat => cat.name)
	const existingNewCats = await tx
		.select()
		.from(categoryTable)
		.where(inArray(categoryTable.name, newCatNames))

	// Filter cats that with name already exist
	const catsToInsert = newCategories.filter(
		newCat => !existingNewCats.some(cat => cat.name === newCat.name),
	)

	// Insert new cats
	let insertedCats: Category[] = []
	if (catsToInsert.length > 0) {
		insertedCats = await tx
			.insert(categoryTable)
			.values(
				catsToInsert.map(cat => ({
					name: cat.name,
					slug: cat.slug,
					description: cat.description,
				})),
			)
			.returning()
	}

	// Combine existing new cats and newly created cats
	const createdCatIds = [
		...existingNewCats.map(cat => cat.id),
		...insertedCats.map(cat => cat.id),
	]

	const allCatIds = [...existingCats.map(cat => cat.id), ...createdCatIds]

	await tx.delete(postToCategory).where(eq(postToCategory.postId, postId))

	if (allCatIds.length > 0) {
		await tx.insert(postToCategory).values(
			allCatIds.map(categoryId => ({
				postId: postId,
				categoryId: categoryId,
			})),
		)

		return await tx
			.select()
			.from(categoryTable)
			.where(inArray(categoryTable.id, allCatIds))
	}

	return []
}
