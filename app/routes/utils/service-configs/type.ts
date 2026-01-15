import type {
	index,
	layout,
	prefix,
	route,
	RouteConfig,
} from '@react-router/dev/routes'

import type { ServiceDashboardConfig } from '~/components/dashboard/service-swicher'

import type { DashboardMenuItem } from '~/components/dashboard/sidebar/nav-menu'
import type { SitemapURL } from '../to-xml-url-tags'

type RouteHelper = {
	index: typeof index
	route: typeof route
	layout: typeof layout
	prefix: typeof prefix
}

export interface Service {
	dashboard?: ServiceDashboardConfig & {
		/**
		 * Routes specific to the service dashboard
		 * @example
		 * ```
		 * routes: ({ route }) => [
		 *   // Absolute path but under /dashboard
		 *   route('/dashboard/your-service-dashboard', './routes/services/example/dashboard/route.tsx'),
		 *
		 *   // Relative path will automatically render and goes under /dashboard
		 *   route('your-service-dashboard', './routes/services/example/dashboard/route.tsx'),
		 * ]
		 * ```
		 */
		routes?: (helper: RouteHelper) => RouteConfig
		/**
		 * sidebar config is how you set sidebar in /dashboard, if you're not using /dashboard, this could be omitted.
		 * @example
		 * ```ts
		 * const MainNavItems: DashboardMenuItem[] = [
		 * 	{ icon: Cloud, title: 'Assets', pathname: 'assets' },
		 * 	{ icon: TextSearch, title: 'SEO', pathname: 'seo' },
		 * ]
		 * ```
		 */
		sidebar?: DashboardMenuItem[]
	}
	/**
	 * Routes specific to the service
	 * @example
	 * ```
	 * routes: ({ route, index }) => [
	 * 		route('/new-shop', './routes/services/new-service/shop/layout.tsx', [
	 * 		index('./routes/services/new-service/shop/index.tsx'),
	 * 		route(
	 * 			':productId',
	 * 			'./routes/services/new-service/shop/product/route.tsx',
	 * 		),
	 * 	]),
	 * ]
	 * ```
	 */
	routes?: (helper: RouteHelper) => RouteConfig
	/**
	 * Sitemap URLs for the service, you may use url to **form absolute URLs**.
	 *
	 * If relative URLs are provided, they will be prefixed with the origin.
	 *
	 * @example
	 * ```ts
	 * sitemap: url => [
	 *		{
	 *			loc: `${url.origin}/example-shop`,
	 *			lastmod: new Date(),
	 *			changefreq: 'daily',
	 *			priority: 0.8,
	 *		},
	 *		{
	 *			loc: '/example-shop/123',
	 *			lastmod: new Date(),
	 *			changefreq: 'weekly',
	 *			priority: 0.5,
	 *		},
	 *	],
	 *	```
	 */
	sitemap?: ((url: URL) => SitemapURL[]) | SitemapURL[]
	/** Routes that posts prefix, using absolute route @default ["/blog"] // if not set. e.g. /blog/:postId */
	blogUrls?: string[]
}
