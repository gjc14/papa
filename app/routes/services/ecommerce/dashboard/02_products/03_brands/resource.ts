import type { Route } from './+types/route'

import { createInsertSchema } from 'drizzle-zod'
import z from 'zod'

import type { ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'
import { validateAdminSession } from '~/routes/auth/utils'

import { ecBrand } from '../../../lib/db/schema'
import { createEcBrand, deleteEcBrands } from '../../../lib/db/taxonomy.server'

const brandInsertUpdateSchema = createInsertSchema(ecBrand)

export const action = async ({ request }: Route.ActionArgs) => {
	await validateAdminSession(request)

	const jsonData = (await request.json()) as unknown

	try {
		switch (request.method) {
			case 'POST':
				const brandData = brandInsertUpdateSchema.parse(jsonData)
				const brand = await createEcBrand(brandData)
				return {
					msg: `Brand ${brand.name} created successfully`,
					data: brand,
				} satisfies ActionResponse
			case 'PUT':
				return {} satisfies ActionResponse
			case 'DELETE':
				const deleteData = z
					.object({ id: z.number(), name: z.string() })
					.parse(jsonData)

				await deleteEcBrands([deleteData.id])

				return {
					msg: `Brand ${deleteData.name} deleted successfully`,
				} satisfies ActionResponse
		}
	} catch (error) {
		return handleError(error, request)
	}
}
