import {
	index,
	prefix,
	route,
	type RouteConfig,
} from '@react-router/dev/routes'

const customizedRoutes = [
	// Add your customized routes here
] satisfies RouteConfig

const systemRoutes = [
	route('/admin', './routes/papa/admin/layout.tsx', [
		index('./routes/papa/admin/index/route.tsx'),

		// Admin API
		...prefix('api', []),

		// Assets
		...prefix('assets', [
			index('./routes/papa/admin/assets/index.tsx'),
			route('resource', './routes/papa/admin/assets/resource.ts'),
		]),

		// Blog
		route('blog', './routes/papa/admin/blog/layout.tsx', [
			index('./routes/papa/admin/blog/index/route.tsx'),
			route('new', './routes/papa/admin/blog/new/route.tsx'),
			route(':postSlug', './routes/papa/admin/blog/post-slug/route.tsx'),
			route('resource', './routes/papa/admin/blog/resource.ts'),
			...prefix('taxonomy', [
				index('./routes/papa/admin/blog/taxonomy/index.tsx'),
				route('resource', './routes/papa/admin/blog/taxonomy/resource.ts'),
			]),
		]),
		// SEO
		...prefix('seo', [
			index('./routes/papa/admin/seo/index.tsx'),
			route('resource', './routes/papa/admin/seo/resource.ts'),
		]),

		// Campaign
		...prefix('campaign', [
			index('./routes/papa/admin/campaign/index/route.tsx'),
			route('resource', './routes/papa/admin/campaign/resource.ts'),
			route(':id', './routes/papa/admin/campaign/edit/route.tsx'),
		]),

		// Account
		route('account', './routes/papa/admin/account/layout.tsx', [
			index('./routes/papa/admin/account/index/route.tsx'),
			route('billing', './routes/papa/admin/account/billing/route.tsx'),
			route(
				'notification',
				'./routes/papa/admin/account/notification/route.tsx',
			),
			route('security', './routes/papa/admin/account/security/route.tsx'),
		]),

		// Company
		route('company', './routes/papa/admin/company/layout.tsx', [
			index('./routes/papa/admin/company/index/route.tsx'),
			route('billing', './routes/papa/admin/company/billing/route.tsx'),
			route(
				'notification',
				'./routes/papa/admin/company/notification/route.tsx',
			),
			route('security', './routes/papa/admin/company/security/route.tsx'),
		]),

		...prefix('users', [
			index('./routes/papa/admin/users/index.tsx'),
			route('resource', './routes/papa/admin/users/resource.ts'),
		]),
		...prefix('admins', [
			index('./routes/papa/admin/admins/index.tsx'),
			route('resource', './routes/papa/admin/admins/resource.ts'),
		]),

		route('*', './routes/papa/admin/$/route.tsx'),

		// Adding admin plugins
		...customizedRoutes,
	]),
] satisfies RouteConfig

export const adminPage = () => {
	return [...systemRoutes]
}
