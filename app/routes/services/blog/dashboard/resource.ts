import { type ActionFunctionArgs } from 'react-router'

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import {
	createPost,
	deletePost,
	deletePosts,
	updatePost,
} from '~/lib/db/post.server'
import { category, post, tag } from '~/lib/db/schema'
import { type ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'
import { validateAdminSession } from '~/routes/papa/auth/utils'

import { postsServerMemoryCache } from './index/cache'

/**
 * createInsertSchema(post) is used for create and update
 * Because the updatePost() also requires complete date to update
 */
const postInsertUpdateSchema = createInsertSchema(post)
const taxonomyInsertUpdateSchema = z.object({
	tags: createSelectSchema(tag).array(),
	categories: createSelectSchema(category).array(),
})
const seoInsertUpdateSchema = z.object({
	seo: z.object({
		metaTitle: z.string().nullable(),
		metaDescription: z.string().nullable(),
		keywords: z.string().nullable(),
		ogImage: z.string().nullable(),
	}),
})

export const action = async ({ request }: ActionFunctionArgs) => {
	await validateAdminSession(request)

	const jsonData = (await request.json()) as unknown

	switch (request.method) {
		case 'POST':
			try {
				// console.log('Creating new post with data:', jsonData)
				const postData = postInsertUpdateSchema.parse(jsonData)
				const taxonomyData = taxonomyInsertUpdateSchema.parse(jsonData)
				const seoData = seoInsertUpdateSchema.parse(jsonData)

				const { post } = await createPost({
					...postData,
					...taxonomyData,
					...seoData,
				})

				postsServerMemoryCache.clear()
				return {
					msg: `Post ${post.title} created successfully`,
					data: post,
				} satisfies ActionResponse
			} catch (error) {
				return handleError(error, request)
			}

		case 'PUT':
			try {
				const postData = postInsertUpdateSchema.parse(jsonData)
				const taxonomyData = taxonomyInsertUpdateSchema.parse(jsonData)
				const seoData = seoInsertUpdateSchema.parse(jsonData)

				if (!postData.id) {
					throw new Error('Post ID is required for update')
				}

				const { post } = await updatePost({
					id: postData.id,
					...postData,
					...taxonomyData,
					...seoData,
				})

				postsServerMemoryCache.clear()
				return {
					msg: `Post ${post.title} updated successfully`,
					data: post,
				} satisfies ActionResponse
			} catch (error) {
				return handleError(error, request)
			}

		case 'DELETE':
			try {
				// Bulk delete ({ ids: number[] })
				if (
					jsonData &&
					typeof jsonData === 'object' &&
					'ids' in jsonData &&
					Array.isArray(jsonData.ids) &&
					jsonData.ids.every((id: unknown) => typeof id === 'number')
				) {
					// When bulk deleting, jsonData can be an array
					const { count } = await deletePosts(jsonData.ids)

					postsServerMemoryCache.clear()
					return {
						msg: `Deleted ${count} posts successfully`,
					} satisfies ActionResponse
				}

				// Single delete
				if (
					jsonData &&
					typeof jsonData === 'object' &&
					'id' in jsonData &&
					typeof jsonData.id === 'number'
				) {
					const { post } = await deletePost(jsonData.id)

					postsServerMemoryCache.clear()
					return {
						msg: `Post ${post.title} deleted successfully`,
					} satisfies ActionResponse
				} else {
					throw new Error('Invalid arguments')
				}
			} catch (error) {
				return handleError(error, request)
			}

		default:
			throw new Response('', { status: 405, statusText: 'Method Not Allowed' })
	}
}
