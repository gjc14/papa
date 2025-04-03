import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { z } from 'zod'

import pkg from 'pg'
const { DatabaseError } = pkg

import { userIs } from '~/lib/db/auth.server'
import {
    createCategory,
    createSubcategory,
    createTag,
    deleteCategory,
    deleteSubcategory,
    deleteTag,
} from '~/lib/db/taxonomy.server'
import { Category, SubCategory, Tag } from '~/lib/db/schema'
import { ConventionalActionResponse } from '~/lib/utils'

const intentSchema = z.enum(['category', 'subcategory', 'tag'])
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
        throw new Response('Method not allowd', { status: 405 })
    }

    await userIs(request, ['ADMIN'])

    const formData = await request.formData()
    const intent = formData.get('intent')

    const { data, success } = intentSchema.safeParse(intent)

    if (!success) {
        throw new Response('Invalid argument', { status: 400 })
    }

    const formObject = Object.fromEntries(formData)

    switch (data) {
        case 'category': {
            const deleteMesage = (name: string) => {
                return '類別 ' + name + ' 已刪除'
            }

            try {
                if (request.method === 'POST') {
                    const { id, name, description } =
                        taxonomySchema.parse(formObject)
                    const { category } = await createCategory({
                        name,
                        description,
                    })
                    return Response.json({
                        msg: 'New category created',
                        data: { ...category, originalId: id },
                        options: {
                            preventAlert: true,
                        },
                    } satisfies ConventionalActionResponse<Category & { originalId: number }>)
                } else if (request.method === 'DELETE') {
                    const { id } = deleteSchema.parse(formObject)
                    const { category } = await deleteCategory(id)
                    if (!category) {
                        return Response.json({
                            err: 'Category not found',
                        } satisfies ConventionalActionResponse)
                    }
                    return Response.json({
                        msg: deleteMesage(category.name),
                    } satisfies ConventionalActionResponse)
                }
            } catch (error) {
                return handleError(error, request, 'category')
            }
        }

        case 'subcategory': {
            const deleteMesage = (name: string) => {
                return '子類別 ' + name + ' 已刪除'
            }

            try {
                if (request.method === 'POST') {
                    const { id, parentId, name, description } =
                        subTaxonomySchema.parse(formObject)
                    const { subcategory } = await createSubcategory({
                        categoryId: parentId,
                        name,
                        description,
                    })
                    return Response.json({
                        msg: 'New subcategory created',
                        data: { ...subcategory, originalId: id },
                        options: {
                            preventAlert: true,
                        },
                    } satisfies ConventionalActionResponse<SubCategory & { originalId: number }>)
                } else if (request.method === 'DELETE') {
                    const { id } = deleteSchema.parse(formObject)
                    const { subcategory } = await deleteSubcategory(id)
                    if (!subcategory) {
                        return Response.json({
                            err: 'Subcategory not found',
                        } satisfies ConventionalActionResponse)
                    }
                    return Response.json({
                        msg: deleteMesage(subcategory.name),
                    } satisfies ConventionalActionResponse)
                }
            } catch (error) {
                return handleError(error, request, 'subcategory')
            }
        }

        case 'tag': {
            const deleteMesage = (name: string) => {
                return '標籤 ' + name + ' 已刪除'
            }

            try {
                if (request.method === 'POST') {
                    const { id, name, description } =
                        taxonomySchema.parse(formObject)
                    const { tag } = await createTag({ name, description })
                    return Response.json({
                        msg: 'New tag created',
                        data: { ...tag, originalId: id },
                        options: {
                            preventAlert: true,
                        },
                    } satisfies ConventionalActionResponse<Tag & { originalId: number }>)
                } else if (request.method === 'DELETE') {
                    const { id } = deleteSchema.parse(formObject)
                    const { tag } = await deleteTag(id)
                    if (!tag) {
                        return Response.json({
                            err: 'Tag not found',
                        } satisfies ConventionalActionResponse)
                    }
                    return Response.json({
                        msg: deleteMesage(tag.name),
                    } satisfies ConventionalActionResponse)
                }
            } catch (error) {
                return handleError(error, request, 'tag')
            }
        }

        default: {
            throw new Response('Invalid argument', { status: 400 })
        }
    }
}

const handleError = (error: unknown, request: Request, intent: Intents) => {
    if (error instanceof z.ZodError) {
        console.error(error.message)
        return Response.json({
            err: 'Internal error: Invalid argument',
        } satisfies ConventionalActionResponse)
    }

    if (error instanceof DatabaseError) {
        console.error(error)
        return Response.json({
            err: error.detail ?? 'Database error',
        } satisfies ConventionalActionResponse)
    }

    console.error(error)
    return Response.json({
        err: `Failed to ${
            request.method === 'POST' ? 'create' : 'delete'
        } ${intent}`,
    } satisfies ConventionalActionResponse)
}

export const loader = () => {
    return redirect('/admin/blog')
}

export default function AdminPostsActionTaxonomy() {
    return null
}
