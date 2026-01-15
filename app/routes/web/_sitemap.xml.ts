/**
 * @see https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap
 * @see https://www.sitemaps.org/protocol.html
 */
import type { LoaderFunctionArgs } from 'react-router'

import * as serverBuild from 'virtual:react-router/server-build'

import { db } from '~/lib/db/db.server'

import { getBlogPrefixes, getSitemapUrls } from '../utils/service-configs'
import { toXmlUrlTagss, type SitemapURL } from '../utils/to-xml-url-tags'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const origin = url.origin

	const systemSitemaps = sitemapUrlsFromServerBuild(origin, serverBuild.routes)
	const serviceSitemapUrls = getSitemapUrls(url)
	const serviceBlogPrefix = await getBlogSitemapUrls(origin, getBlogPrefixes())

	const urlTags = toXmlUrlTagss([
		{
			loc: origin,
			lastmod: new Date(),
		},
		...systemSitemaps,
		...serviceSitemapUrls.map(url => ({
			...url,
			loc: url.loc.startsWith('/') ? `${origin}${url.loc}` : url.loc,
			lastmod: url.lastmod ?? new Date(),
		})),
		...serviceBlogPrefix,
	])

	try {
		return new Response(
			`<?xml version="1.0" encoding="UTF-8"?>
				<urlset
					xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
				>
					${urlTags.join('\n')}
				</urlset>`,
			{
				status: 200,
				headers: {
					'Content-Type': 'application/xml',
					'X-Content-Type-Options': 'nosniff',
					'Cache-Control': 'public, max-age=3600',
				},
			},
		)
	} catch (e) {
		console.error('Error generating sitemap:', e)
		throw new Response('', { status: 500 })
	}
}

/**
 * Generate sitemap URLs from server build routes
 */
function sitemapUrlsFromServerBuild(
	origin: string,
	routes: typeof serverBuild.routes,
): SitemapURL[] {
	const urls: SitemapURL[] = []
	const now = new Date()

	for (const key in routes) {
		/**
		 * 'routes/dashboard/assets/resource': {
		 *   id: 'routes/dashboard/assets/resource',
		 *   parentId: 'routes/dashboard/layout/route',
		 *   path: 'assets/resource',
		 *   index: undefined,
		 *   caseSensitive: undefined,
		 *   module: [Object: null prototype] [Module] {
		 *     action: [Getter],
		 *     loader: [Getter]
		 *   }
		 * },
		 */
		const route = routes[key]
		if (!route || !route.path) continue
		const path = route.path

		if (
			!path.includes(':') && // exclude dynamic segments
			!path.includes('*') // exclude catch-all segments
		) {
			let parentRoute = route.parentId ? routes[route.parentId] : undefined
			let fullPath = path

			while (parentRoute) {
				if (parentRoute?.path) {
					fullPath = `${parentRoute.path}/${fullPath}`
				}
				parentRoute = parentRoute.parentId
					? routes[parentRoute.parentId]
					: undefined
			}

			// filter
			if (
				fullPath.startsWith('/dashboard') ||
				fullPath.startsWith('/api') ||
				['/sitemap.xml', '/robots.txt'].includes(fullPath)
			) {
				continue
			}

			urls.push({
				loc: `${origin}${fullPath}`,
				lastmod: now,
			})
		}
	}

	return urls
}

/**
 * Generate blog sitemap URLs using posts from the database
 */
async function getBlogSitemapUrls(
	origin: string,
	blogUrls: string[],
): Promise<SitemapURL[]> {
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
