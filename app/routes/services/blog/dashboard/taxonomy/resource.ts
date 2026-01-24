import { redirect, type ActionFunctionArgs } from 'react-router'

import { z } from 'zod'

import { type ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'

import {
	createCategory,
	createChildCategory,
	createTag,
	deleteCategory,
	deleteTag,
} from '../../lib/db/taxonomy.server'

const intentSchema = z.enum(['category', 'child-category', 'tag'])
export type Intents = z.infer<typeof intentSchema>

// Schema for both category and tag
export const taxonomySchema = z.object({
	id: z.string().transform(val => Number(val)),
	name: z.string(),
	description: z.string().optional(),
})

const subTaxonomySchema = z.object({
	id: z.string().transform(val => Number(val)),
	parentId: z.string().transform(val => Number(val)),
	name: z.string(),
	description: z.string().optional(),
})

const deleteSchema = z.object({
	id: z.string().transform(val => Number(val)),
})

export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method !== 'POST' && request.method !== 'DELETE') {
		throw new Response('', { status: 405 })
	}

	const formData = await request.formData()
	const intent = formData.get('intent')

	const { data, success } = intentSchema.safeParse(intent)

	if (!success) {
		throw new Response('', { status: 400 })
	}

	const formObject = Object.fromEntries(formData)

	const errorMessage = `Failed to ${
		request.method === 'POST' ? 'create' : 'delete'
	} ${intent}`

	switch (data) {
		case 'category': {
			const deleteMesage = (name: string) => {
				return `Category ${name} deleted`
			}

			try {
				if (request.method === 'POST') {
					const { id, name, description } = taxonomySchema.parse(formObject)
					const { category } = await createCategory({
						name,
						description,
					})
					return {
						msg: 'New category created',
						data: { ...category, originalId: id },
						preventNotification: true,
					} satisfies ActionResponse
				} else if (request.method === 'DELETE') {
					const { id } = deleteSchema.parse(formObject)
					const { category } = await deleteCategory(id)
					if (!category) {
						return {
							err: 'Category not found',
						} satisfies ActionResponse
					}
					return {
						msg: deleteMesage(category.name),
					} satisfies ActionResponse
				}
			} catch (error) {
				return handleError(error, request, {
					errorMessage,
				})
			}
		}

		case 'child-category': {
			const deleteMesage = (name: string) => {
				return `Child category ${name} deleted`
			}

			try {
				if (request.method === 'POST') {
					const { id, parentId, name, description } =
						subTaxonomySchema.parse(formObject)
					const { category } = await createChildCategory({
						parentId: parentId,
						name,
						description,
					})
					return {
						msg: 'New child category created',
						data: { ...category, originalId: id },
						preventNotification: true,
					} satisfies ActionResponse
				} else if (request.method === 'DELETE') {
					const { id } = deleteSchema.parse(formObject)
					const { category } = await deleteCategory(id)
					if (!category) {
						return {
							err: 'Category not found',
						} satisfies ActionResponse
					}
					return {
						msg: deleteMesage(category.name),
					} satisfies ActionResponse
				}
			} catch (error) {
				return handleError(error, request, {
					errorMessage,
				})
			}
		}

		case 'tag': {
			const deleteMesage = (name: string) => {
				return `Tag ${name} deleted`
			}

			try {
				if (request.method === 'POST') {
					const { id, name, description } = taxonomySchema.parse(formObject)
					const { tag } = await createTag({ name, description })
					return {
						msg: 'New tag created',
						data: { ...tag, originalId: id },
						preventNotification: true,
					} satisfies ActionResponse
				} else if (request.method === 'DELETE') {
					const { id } = deleteSchema.parse(formObject)
					const { tag } = await deleteTag(id)
					if (!tag) {
						return {
							err: 'Tag not found',
						} satisfies ActionResponse
					}
					return {
						msg: deleteMesage(tag.name),
					} satisfies ActionResponse
				}
			} catch (error) {
				return handleError(error, request, {
					errorMessage,
				})
			}
		}

		default: {
			throw new Response('', { status: 400 })
		}
	}
}

export const loader = () => {
	return redirect('/dashboard/blog')
}

export default function DashboardPostsActionTaxonomy() {
	return null
}
