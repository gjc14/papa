import { registerSystemEndpoints } from '~/lib/service/system-endpoints-registry'
import type { SitemapUrlConfig } from '~/lib/service/utils'

import { dbBlog as db } from './lib/db/db.server'

registerSystemEndpoints({
	sitemap: async url => getBlogSitemap(url.origin),
})

/**
 * Generate blog sitemap URLs using posts from the database
 */
async function getBlogSitemap(origin: string): Promise<SitemapUrlConfig[]> {
	const urls: SitemapUrlConfig[] = []
	const now = new Date()

	const posts = await db.query.post.findMany({
		where(fields, { eq }) {
			return eq(fields.status, 'PUBLISHED')
		},
		columns: {
			slug: true,
			updatedAt: true,
		},
	})

	// TODO: Now there are duplicate `/blog` loc. Add blog routes from db (configurable blog base path)
	const blogUrls = ['/blog']

	// Generate URLs for blogs and their posts
	for (const blogUrl of blogUrls) {
		urls.push({
			loc: `${origin}${blogUrl}`,
			lastmod: now,
		})

		for (const post of posts) {
			urls.push({
				loc: `${origin}${blogUrl}/${post.slug}`,
				lastmod: post.updatedAt,
			})
		}
	}

	return urls
}
