import { registerServiceSitemap } from '~/lib/service/sitemap-registry'
import type { SitemapURL } from '~/lib/utils/sitemap-to-xml'

import { dbBlog as db } from './lib/db/db.server'

registerServiceSitemap(async url => getBlogSitemapUrls(url.origin))

/**
 * Generate blog sitemap URLs using posts from the database
 */
async function getBlogSitemapUrls(origin: string): Promise<SitemapURL[]> {
	const urls: SitemapURL[] = []
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
