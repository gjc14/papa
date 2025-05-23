import { eq } from 'drizzle-orm'

import { db } from './db.server'
import { seosTable, type Seo } from './schema'

export const getSEOs = async (): Promise<{
	seos: (Seo & { post: { slug: string } | null })[]
}> => {
	const seos = await db.query.seosTable.findMany({
		with: {
			post: { columns: { slug: true } },
		},
	})

	return { seos }
}

/**
 * Get the SEO data for a specific route
 * @param route - relative route e.g. /blog
 * @returns SEO data
 *
 * @example
 * ```tsx
 * const pathname = new URL(request.url).pathname
 * const { seo } = await getSEO(pathname)
 * ```
 */
export const getSEO = async (route: string): Promise<{ seo: Seo | null }> => {
	const seo =
		(await db.query.seosTable.findFirst({
			where: (t, { eq }) => eq(t.route, route),
		})) ?? null
	return { seo }
}

export const createSEO = async (props: {
	route: string
	metaTitle: string
	metaDescription: string
	autoGenerated: boolean
	keywords: string
}): Promise<{ seo: Seo }> => {
	const [seo] = await db.insert(seosTable).values(props).returning()
	return { seo }
}

export const updateSEO = async (props: {
	id: number
	metaTitle: string
	metaDescription: string
	keywords: string
}): Promise<{ seo: Seo }> => {
	const [seo] = await db
		.update(seosTable)
		.set(props)
		.where(eq(seosTable.id, props.id))
		.returning()

	return { seo }
}

export const deleteSEO = async (id: number): Promise<{ seo: Seo }> => {
	const [seo] = await db
		.delete(seosTable)
		.where(eq(seosTable.id, id))
		.returning()
	return { seo }
}
