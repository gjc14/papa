import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { file } from '~/lib/db/schema'

// Request schemas
const inputSchema = z.object({
	key: z.string(),
	filename: z.string(),
	type: z.string(),
	size: z.number(),
	checksum: z.string(),
})
export const presignUrlRequestSchema = z.array(inputSchema)
export type PresignRequest = z.infer<typeof presignUrlRequestSchema>

const fileMetadataSchama = createSelectSchema(file).extend({
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deletedAt: z.coerce.date().nullable(),
})

// Response schemas
const outputSchema = z.object({
	metadata: fileMetadataSchama,
	presignedUrl: z.string().url(),
})
export const presignUrlResponseSchema = z.array(outputSchema)
export type PresignResponse = z.infer<typeof presignUrlResponseSchema>
