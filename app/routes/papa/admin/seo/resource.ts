import { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'

import { userIs } from '~/lib/db/auth.server'
import { createSEO, deleteSEO, updateSEO } from '~/lib/db/seo.server'
import { ConventionalActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'

export const SeoCreateSchmea = z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.string(),
    route: z.string(),
})

export const SeoUpdateSchmea = z.object({
    id: z.string().transform(val => Number(val)),
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.string(),
})

export const action = async ({ request }: ActionFunctionArgs) => {
    if (!['POST', 'PUT', 'DELETE'].includes(request.method)) {
        return Response.json({
            err: 'Method not allowed',
        } satisfies ConventionalActionResponse)
    }

    await userIs(request, ['ADMIN'])

    const formData = await request.formData()
    const seoRequested = Object.fromEntries(formData)

    switch (request.method) {
        case 'POST':
            try {
                const seoToCreate = SeoCreateSchmea.parse(seoRequested)
                const { seo } = await createSEO({
                    metaTitle: seoToCreate.metaTitle,
                    metaDescription: seoToCreate.metaDescription,
                    route: seoToCreate.route,
                    autoGenerated: false,
                    keywords: seoToCreate.keywords,
                })
                return Response.json({
                    msg: `SEO for ${
                        seo.route || seo.metaTitle || 'unknown'
                    } created`,
                } satisfies ConventionalActionResponse)
            } catch (error) {
                return handleError(error, request)
            }
        case 'PUT':
            try {
                const seoToUpdate = SeoUpdateSchmea.parse(seoRequested)
                const { seo } = await updateSEO({
                    id: seoToUpdate.id,
                    metaTitle: seoToUpdate.metaTitle,
                    metaDescription: seoToUpdate.metaDescription,
                    keywords: seoToUpdate.keywords,
                })
                return Response.json({
                    msg: `SEO for ${
                        seo.route || seo.metaTitle || 'unknown'
                    } updated`,
                } satisfies ConventionalActionResponse)
            } catch (error) {
                return handleError(error, request)
            }
        case 'DELETE':
            try {
                const id = seoRequested.id
                if (!Number.isNaN(id)) {
                    const { seo } = await deleteSEO(Number(id))
                    return Response.json({
                        msg: `SEO for ${
                            seo.route || seo.metaTitle || 'unknown'
                        } delete`,
                    } satisfies ConventionalActionResponse)
                } else {
                    throw new Error('Invalid argument')
                }
            } catch (error) {
                return handleError(error, request)
            }
    }
}
