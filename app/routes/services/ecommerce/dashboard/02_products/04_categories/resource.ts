import type { Route } from './+types/route'

import { createInsertSchema } from 'drizzle-zod'
import z from 'zod'

import type { ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'

import { ecCategory } from '../../../lib/db/schema'
import {
	createEcCategory,
	deleteEcCategories,
} from '../../../lib/db/taxonomy.server'

const categoryInsertUpdateSchema = createInsertSchema(ecCategory)

export const action = async ({ request }: Route.ActionArgs) => {
	const jsonData = (await request.json()) as unknown

	try {
		switch (request.method) {
			case 'POST':
				const categoryData = categoryInsertUpdateSchema.parse(jsonData)
				const category = await createEcCategory(categoryData)
				return {
					msg: `Category ${category.name} created successfully`,
					data: category,
				} satisfies ActionResponse
			case 'PUT':
				return {} satisfies ActionResponse
			case 'DELETE':
				const deleteData = z
					.object({ id: z.number(), name: z.string() })
					.parse(jsonData)

				await deleteEcCategories([deleteData.id])

				return {
					msg: `Category ${deleteData.name} deleted successfully`,
				} satisfies ActionResponse
		}
	} catch (error) {
		return handleError(error, request)
	}
}
