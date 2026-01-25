import { registerServiceSitemap } from '~/lib/service/sitemap-registry'
import type { SitemapURL } from '~/lib/utils/sitemap-to-xml'

import { dbEcommerce as db } from './lib/db/db.server'

registerServiceSitemap(url => getStoreSitemapUrls(url.origin))

/**
 * Generate store sitemap URLs using products from the database
 */
async function getStoreSitemapUrls(origin: string): Promise<SitemapURL[]> {
	const urls: SitemapURL[] = []
	const now = new Date()

	const products = await db.query.product.findMany({
		where(fields, { eq }) {
			return eq(fields.status, 'PUBLISHED')
		},
		columns: {
			slug: true,
			updatedAt: true,
		},
	})

	// TODO: Now there are duplicate `/store` loc. Add store routes from db (configurable store base path)
	const storeUrls = ['/store']

	// Generate URLs for stores and their products
	for (const storeUrl of storeUrls) {
		urls.push({
			loc: `${origin}${storeUrl}`,
			lastmod: now,
		})

		for (const product of products) {
			urls.push({
				loc: `${origin}${storeUrl}/product/${product.slug}`,
				lastmod: product.updatedAt,
			})
		}
	}

	return urls
}
