/**
 * Dashboard E-Commerce Multiple Products CUD Route. For individual product CUD, refer to /dashboard/ecommerce/products/:productSlug/resource
 * /dashboard/ecommerce/products/resource
 *
 * # Methods:
 *
 * ## POST
 *
 * ## PUT
 *
 * ## DELETE
 *
 * Delete multiple products in ID Array of the JSON body.
 */

import type { Route } from './+types/resource'

import z from 'zod'

import type { ActionResponse } from '~/lib/utils'
import { validateAdminSession } from '~/routes/papa/auth/utils'

import { moveProductsToTrash } from '../../lib/db/product.server'

const mTTSchema = z.array(
	z.object({
		id: z.number(),
		name: z.string(),
	}),
)

export const action = async ({ request }: Route.ActionArgs) => {
	const { user } = await validateAdminSession(request)
	const jsonData = await request.json()

	switch (request.method) {
		case 'DELETE':
			const mTTData = mTTSchema.parse(jsonData)
			const result = await moveProductsToTrash(mTTData.map(d => d.id))

			return {
				msg: `${mTTData.length} ${mTTData.length > 1 ? 'Products' : 'Product'}: ${mTTData.map(d => d.name).join(', ')} moved to trash`,
				data: result,
			} satisfies ActionResponse

		default:
			throw new Response('Method Not Allowed', { status: 405 })
	}
}
