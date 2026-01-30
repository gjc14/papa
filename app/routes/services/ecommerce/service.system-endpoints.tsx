import { registerSystemEndpoints } from '~/lib/service/system-endpoints-registry'
import type { SitemapUrlConfig } from '~/lib/service/utils'

import { dbEcommerce as db } from './lib/db/db.server'

registerSystemEndpoints({
	sitemap: url => getStoreSitemap(url.origin),
	robots: () => {
		// TODO: Now there are duplicate `/store` loc. Add store routes from db (configurable store base path)
		const storeUrls = ['/store']

		return {
			groups: [
				{
					userAgents: ['*'],
					allow: storeUrls.map(p => (p.endsWith('/') ? p : p + '/')),
					crawlDelay: 300,
				},
			],
		}
	},
})

/**
 * Generate store sitemap URLs using products from the database
 */
async function getStoreSitemap(origin: string): Promise<SitemapUrlConfig[]> {
	const urls: SitemapUrlConfig[] = []
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
