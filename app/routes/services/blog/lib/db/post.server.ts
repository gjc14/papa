import camelcaseKeys from 'camelcase-keys'
import { eq, inArray, sql } from 'drizzle-orm'

import { seo as seoTable, user, type Seo } from '~/lib/db/schema'

import { convertDateFields } from '../../../../../lib/db/utils'
import { dbBlog as db } from './db.server'
import {
	category as categoryTable,
	post as postTable,
	postToCategory,
	postToTag,
	tag as tagTable,
	type Category,
	type Post,
	type PostStatus,
	type Tag,
} from './schema'

type User = typeof user.$inferSelect

type TransactionType = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]

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
	categoryFilter?: Pick<Category, 'id' | 'name' | 'slug'>[]
	tagFilter?: Pick<Tag, 'id' | 'name' | 'slug'>[]
}> => {
	const { status = 'PUBLISHED', categories = [], tags = [], title } = props

	const [postData, tagsData, categoriesData] = await Promise.all([
		db.execute<PostWithRelations>(sql`
		SELECT
			DISTINCT ON (p.id)
			p.*,
			row_to_json(u) AS author,
			row_to_json(s) AS seo,
			COALESCE(
				(
					SELECT json_agg(row_to_json(t))
					FROM ${postToTag} pt
					LEFT JOIN ${tagTable} t ON pt.tag_id = t.id
					WHERE pt.post_id = p.id
				),
				'[]'::json
			) AS tags,
			COALESCE(
				(
					SELECT json_agg(row_to_json(c))
					FROM ${postToCategory} pc
					LEFT JOIN ${categoryTable} c ON pc.category_id = c.id
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
		LEFT JOIN ${seoTable} s ON s.id = p.seo_id
		WHERE (
			${status !== 'ALL' ? sql`p.status = ${status}` : sql`TRUE`}
			AND ${title ? sql`p.title ILIKE ${'%' + title + '%'}` : sql`TRUE`}
			AND ${tags.length ? sql`t.slug = ANY(ARRAY[${sql.join(tags, sql`,`)}])` : sql`TRUE`}
			AND ${categories.length ? sql`c.slug = ANY(ARRAY[${sql.join(categories, sql`,`)}])` : sql`TRUE`}
			-- more conditions
		)
	`),
		tags.length
			? db.execute(sql`
					SELECT
						${tagTable.id},
						${tagTable.name},
						${tagTable.slug}
					FROM ${tagTable}
					WHERE ${tagTable.slug} = ANY(ARRAY[${sql.join(tags, sql`,`)}])
				`)
			: { rows: [] },
		categories.length
			? db.execute(sql`
					SELECT
						${categoryTable.id},
						${categoryTable.name},
						${categoryTable.slug}
					FROM ${categoryTable}
					WHERE ${categoryTable.slug} = ANY(ARRAY[${sql.join(categories, sql`,`)}])
				`)
			: { rows: [] },
	])

	return {
		posts: convertDateFields(camelcaseKeys(postData.rows, { deep: true }), [
			'createdAt',
			'updatedAt',
			'deletedAt',
			'publishedAt',
			'banExpires',
		]),
		tagFilter: tagsData.rows as Pick<Tag, 'id' | 'name' | 'slug'>[],
		categoryFilter: categoriesData.rows as Pick<
			Category,
			'id' | 'name' | 'slug'
		>[],
	}
}

export const getPostBySlug = async (
	slug: string,
	status: PostStatus | 'EDIT' = 'PUBLISHED',
): Promise<{
	post: PostWithRelations | null
	prevPost: Pick<PostWithRelations, 'slug' | 'title'> | null
	nextPost: Pick<PostWithRelations, 'slug' | 'title'> | null
}> => {
	const postResult = await db.execute<
		PostWithRelations & {
			prevTitle: PostWithRelations['title']
			prevSlug: PostWithRelations['slug']
			nextTitle: PostWithRelations['title']
			nextSlug: PostWithRelations['slug']
		}
	>(sql`
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
		LEFT JOIN ${seoTable} s ON s.id = op.seo_id

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
		camelcaseKeys(postResult.rows[0], { deep: true }),
		['createdAt', 'updatedAt', 'deletedAt', 'publishedAt', 'banExpires'],
	)

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
	seo: Pick<Seo, 'metaDescription' | 'metaTitle' | 'keywords' | 'ogImage'>
}

/**
 * This function does not uses id and seoId from the props.
 * post id placeholder: -1
 * post seoId placeholder: -1
 */
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
		const [seoCreated] = await tx
			.insert(seoTable)
			.values({
				metaTitle: seo.metaTitle || title,
				metaDescription: seo.metaDescription || excerpt || '',
				keywords: seo.keywords || '',
				ogImage: seo.ogImage || featuredImage || null,
				autoGenerated: true,
				route: '/blog/' + slug,
			})
			.returning()

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
				seoId: seoCreated.id,
			})
			.returning()

		const author = authorId
			? ((await tx.query.user.findFirst({
					where: (users, { eq }) => eq(users.id, authorId),
				})) ?? null)
			: null

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
				keywords: seo.keywords || '',
				ogImage: seo.ogImage || featuredImage || null,
			})
			.where(eq(seoTable.id, postUpdated.seoId))
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

export const deletePosts = async (
	ids: number[],
): Promise<{ count: number }> => {
	const posts = await db
		.delete(postTable)
		.where(inArray(postTable.id, ids))
		.returning()
	return { count: posts.length }
}

const processTaxonomyTags = async (
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
	if (tagsToInsert.length) {
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
	if (allTagIds.length) {
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

const processTaxonomyCategories = async (
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
	if (catsToInsert.length) {
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

	if (allCatIds.length) {
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
