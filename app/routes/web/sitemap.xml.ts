/**
 * @see https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap
 * @see https://www.sitemaps.org/protocol.html
 */
import type { Route } from './+types/sitemap.xml'

import * as serverBuild from 'virtual:react-router/server-build'

import { getServiceSitemapUrlConfigs } from '~/lib/service/system-endpoints.server'

import {
	configsToSitemapXml,
	type SitemapUrlConfig,
} from '../../lib/service/utils'

export const loader = async ({ request }: Route.LoaderArgs) => {
	const url = new URL(request.url)
	const origin = url.origin

	const systemSitemaps = sitemapUrlsFromServerBuild(origin, serverBuild.routes)
	const serviceSitemapUrls = await getServiceSitemapUrlConfigs(url)

	const urlTags = configsToSitemapXml([
		{
			loc: origin,
			lastmod: new Date(),
		},
		...systemSitemaps,
		...serviceSitemapUrls,
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
): SitemapUrlConfig[] {
	const urls: SitemapUrlConfig[] = []
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
