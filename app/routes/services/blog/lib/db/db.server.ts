import { drizzle } from 'drizzle-orm/node-postgres'

import * as schemaSystem from '~/lib/db/schema'

import * as schema from './schema'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined')
}

export const dbBlog = drizzle(process.env.DATABASE_URL, {
	schema: { ...schema, ...schemaSystem },
	casing: 'snake_case',
})

export type TransactionType = Parameters<
	Parameters<(typeof dbBlog)['transaction']>[0]
>[0]
