import { registerServiceRoutes } from '../../../lib/service/routes-registry'

registerServiceRoutes({
	dashboardRoutes: ({ route, index, prefix }) => [
		route('blog', './routes/services/blog/dashboard/layout.tsx', [
			index('./routes/services/blog/dashboard/index/route.tsx'),
			route(
				':postSlug',
				'./routes/services/blog/dashboard/post-slug/route.tsx',
			),
			route('resource', './routes/services/blog/dashboard/resource.ts'),
			...prefix('taxonomy', [
				index('./routes/services/blog/dashboard/taxonomy/index.tsx'),
				route(
					'resource',
					'./routes/services/blog/dashboard/taxonomy/resource.ts',
				),
			]),
		]),
	],
	routes: ({ route, index }) => [
		route('/blog', './routes/services/blog/web/layout.tsx', [
			index('./routes/services/blog/web/index/route.tsx'),
			route(':postSlug', './routes/services/blog/web/post-slug/route.tsx'),
			route(
				':postSlug/edit',
				'./routes/services/blog/web/post-slug-edit/route.tsx',
			),
			route('subscribe', './routes/services/blog/web/subscribe/route.tsx'),
		]),
	],
})
