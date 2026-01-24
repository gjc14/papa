import type { Route } from './+types/route'

import { createInsertSchema } from 'drizzle-zod'
import z from 'zod'

import type { ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'

import { ecTag } from '../../../lib/db/schema'
import { createEcTag, deleteEcTags } from '../../../lib/db/taxonomy.server'

const tagInsertUpdateSchema = createInsertSchema(ecTag)

export const action = async ({ request }: Route.ActionArgs) => {
	const jsonData = (await request.json()) as unknown

	try {
		switch (request.method) {
			case 'POST':
				const tagData = tagInsertUpdateSchema.parse(jsonData)
				const tag = await createEcTag(tagData)
				return {
					msg: `Tag ${tag.name} created successfully`,
					data: tag,
				} satisfies ActionResponse
			case 'PUT':
				return {} satisfies ActionResponse
			case 'DELETE':
				const deleteData = z
					.object({ id: z.number(), name: z.string() })
					.parse(jsonData)

				await deleteEcTags([deleteData.id])

				return {
					msg: `Tag ${deleteData.name} deleted successfully`,
				} satisfies ActionResponse
		}
	} catch (error) {
		return handleError(error, request)
	}
}
