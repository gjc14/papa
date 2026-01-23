import type {
	index,
	layout,
	prefix,
	route,
	RouteConfig,
} from '@react-router/dev/routes'

import type { SidebarPrimaryItem } from '~/components/dashboard/sidebar/sidebar-primary'
import type { SidebarSecondaryItem } from '~/components/dashboard/sidebar/sidebar-secondary'
import type { ServiceDashboardConfig } from '~/components/dashboard/sidebar/sidebar-service'

import type { SitemapURL } from '../utils/sitemap-to-xml'

type RouteHelper = {
	index: typeof index
	route: typeof route
	layout: typeof layout
	prefix: typeof prefix
}

interface ServiceDashboard extends ServiceDashboardConfig {
	/**
	 * How you set sidebar in /dashboard, if you're not using /dashboard, this could be omitted.
	 */
	sidebar?: {
		/**
		 * @example
		 * const primary: [
		 * 	{ icon: Cloud, title: 'Assets', pathname: 'assets' },
		 * 	{ icon: TextSearch, title: 'SEO', pathname: 'seo' },
		 * ],
		 */
		primary?: SidebarPrimaryItem[]
		/**
		 * @example
		 * const secondary: [
		 * 	{ title: 'Feedback'; action: () => alert('feedback'); icon: Send },
		 * 	{ title: 'Company'; url: '/dashboard/company'; icon: Building },
		 * ]
		 *
		 */
		secondary?: SidebarSecondaryItem[]
	}
}

interface ServiceRoutesModule {
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
	dashboardRoutes?: (helper: RouteHelper) => RouteConfig
}

/**
 * By default, sitemap will generate all routes defined, except `/api/*`, `/dashboard/*`, `/sitemap.xml`, and `/robots.txt`.
 * Therefore only dynamic or extra URLs need to be defined here.
 *
 * If absolute URLs are provided or value does not start with `url.origin` in `loc`, it will automatically prefixed with `url.origin`.
 *
 * @example
 * ```ts
 * const getBlogSitemapUrls = async (origin: string): Promise<SitemapURL[]> => {
 * 		const { dbBlog: db } = await import('./lib/db/db.server')
 * 		const urls: SitemapURL[] = []
 *
 * 		const posts = await db.query.post.findMany()
 *
 * 		for (const post of posts) {
 * 			urls.push({
 * 				loc: `${origin}/blog/${post.slug}`,
 * 				lastmod: new Date(post.updatedAt),
 * 				changefreq: 'monthly',
 * 				priority: 0.7,
 * 			})
 * 		}
 *
 * 		return urls
 * }
 * registerService({
 * 		// ...
 * 		sitemap: async url => await getBlogSitemapUrls(url.origin)
 * })
 * // or
 * registerService({
 * 		// ...
 *  	sitemap: url => [
 * 			{
 * 				loc: `/example-service`, // becomes `${url.origin}/example-service/docs`
 * 				lastmod: new Date(),
 * 				changefreq: 'daily',
 * 				priority: 0.8,
 * 			},
 * 			{
 * 				loc: 'example-service/docs', // becomes `${url.origin}/example-service/docs`
 * 				lastmod: new Date(),
 * 				changefreq: 'weekly',
 * 				priority: 0.5,
 * 			},
 * 		],
 * })
 *	```
 */
type ServiceSitemap =
	| SitemapURL[]
	| ((url: URL) => SitemapURL[])
	| ((url: URL) => Promise<SitemapURL[]>)

export type { ServiceRoutesModule, ServiceDashboard, ServiceSitemap }
