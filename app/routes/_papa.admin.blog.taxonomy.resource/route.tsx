import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { z } from 'zod'

import { userIs } from '~/lib/db/auth.server'
import {
    createCategory,
    createSubcategory,
    createTag,
    deleteCategory,
    deleteSubcategory,
    deleteTag,
} from '~/lib/db/blog-taxonomy.server'
import { ConventionalActionResponse } from '~/lib/utils'

const intentSchema = z.enum(['category', 'subcategory', 'tag'])
export type Intents = z.infer<typeof intentSchema>

// Schema for both category and tag
export const taxonomySchema = z.object({
    id: z.string(),
    name: z.string(),
})

const subTaxonomySchema = z.object({
    id: z.string(),
    name: z.string(),
    parentId: z.string(),
})

const deleteSchema = z.object({
    id: z.string(),
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
                    const { id, name } = taxonomySchema.parse(formObject)
                    await createCategory({ id, name })
                    return Response.json(
                        null satisfies ConventionalActionResponse
                    )
                } else if (request.method === 'DELETE') {
                    const { id } = deleteSchema.parse(formObject)
                    const { category } = await deleteCategory(id)
                    return Response.json({
                        msg: deleteMesage(category.name),
                    } satisfies ConventionalActionResponse)
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return Response.json({
                        err: 'Invalid argument',
                    } satisfies ConventionalActionResponse)
                }
                console.error(error)
                return Response.json({
                    err: 'Failed to delete category',
                } satisfies ConventionalActionResponse)
            }
        }

        case 'subcategory': {
            const deleteMesage = (name: string) => {
                return '子類別 ' + name + ' 已刪除'
            }

            try {
                if (request.method === 'POST') {
                    const { id, name, parentId } =
                        subTaxonomySchema.parse(formObject)
                    await createSubcategory({ id, name, categoryId: parentId })
                    return Response.json(
                        null satisfies ConventionalActionResponse
                    )
                } else if (request.method === 'DELETE') {
                    const { id } = deleteSchema.parse(formObject)
                    const { subcategory } = await deleteSubcategory(id)
                    return Response.json({
                        msg: deleteMesage(subcategory.name),
                    } satisfies ConventionalActionResponse)
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return Response.json({
                        err: 'Invalid argument',
                    } satisfies ConventionalActionResponse)
                }
                console.error(error)
                return Response.json({
                    err: 'Failed to delete category',
                } satisfies ConventionalActionResponse)
            }
        }

        case 'tag': {
            const deleteMesage = (name: string) => {
                return '標籤 ' + name + ' 已刪除'
            }

            try {
                if (request.method === 'POST') {
                    const { id, name } = taxonomySchema.parse(formObject)
                    await createTag({ id, name })
                    return Response.json(
                        null satisfies ConventionalActionResponse
                    )
                } else if (request.method === 'DELETE') {
                    const { id } = deleteSchema.parse(formObject)
                    const { tag } = await deleteTag(id)
                    return Response.json({
                        msg: deleteMesage(tag.name),
                    } satisfies ConventionalActionResponse)
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return Response.json({
                        err: 'Invalid argument',
                    } satisfies ConventionalActionResponse)
                }
                console.error(error)
                return Response.json({
                    err: 'Failed to delete tag',
                } satisfies ConventionalActionResponse)
            }
        }

        default: {
            throw new Response('Invalid argument', { status: 400 })
        }
    }
}

export const loader = () => {
    return redirect('/admin/blog')
}

export default function AdminPostsActionTaxonomy() {
    return null
}
