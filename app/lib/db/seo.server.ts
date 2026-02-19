import { eq } from 'drizzle-orm'

import { db } from './db.server'
import { seo as seoTable, type Seo } from './schema'

export const getSeos = async (): Promise<{
	seos: Seo[]
}> => {
	const seos = await db.query.seo.findMany()

	return { seos }
}

/**
 * Get the SEO data for a specific relative route
 * @param route relative route
 * @returns SEO data for the route
 *
 * @example
 * ```tsx
 * const pathname = new URL(request.url).pathname
 * const seo = await getSeo(pathname)
 * ```
 */
export const getSeo = async (route: string): Promise<typeof seo> => {
	const seo = await db.query.seo.findFirst({
		where: (t, { eq }) => eq(t.route, route),
	})
	return seo
}

export const createSeo = async (
	props: Omit<Seo, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<typeof seo> => {
	const [seo] = await db.insert(seoTable).values(props).returning()
	return seo
}

export const updateSeo = async (
	props: Partial<Seo> & Pick<Seo, 'id'>,
): Promise<typeof seo> => {
	const [seo] = await db
		.update(seoTable)
		.set(props)
		.where(eq(seoTable.id, props.id))
		.returning()

	return seo
}

export const deleteSeo = async (id: number): Promise<typeof seo> => {
	const [seo] = await db.delete(seoTable).where(eq(seoTable.id, id)).returning()
	return seo
}
