import type { Route } from './+types/route'

import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

import type { ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'
import { validateAdminSession } from '~/routes/auth/utils'

import { ecAttribute } from '../../../lib/db/schema'
import {
	createEcAttribute,
	deleteEcAttributes,
} from '../../../lib/db/taxonomy.server'

const attributeInsertUpdateSchema = createInsertSchema(ecAttribute)

export const action = async ({ request }: Route.ActionArgs) => {
	await validateAdminSession(request)

	const jsonData = (await request.json()) as unknown

	try {
		switch (request.method) {
			case 'POST':
				const attributeData = attributeInsertUpdateSchema.parse(jsonData)
				const attribute = await createEcAttribute(attributeData)
				return {
					msg: `Attribute ${attribute.name} created successfully`,
				} satisfies ActionResponse
			case 'PUT':
				return {} satisfies ActionResponse
			case 'DELETE':
				const deleteData = z
					.object({ id: z.number(), name: z.string() })
					.parse(jsonData)

				await deleteEcAttributes([deleteData.id])

				return {
					msg: `Attribute ${deleteData.name} deleted successfully`,
				} satisfies ActionResponse
		}
	} catch (error) {
		return handleError(error, request)
	}
}
