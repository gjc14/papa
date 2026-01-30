import {
	index,
	prefix,
	route,
	type RouteConfig,
} from '@react-router/dev/routes'

import { getServicesDashboardRoutes, getWebRoutes } from './lib/service/routes'

export default [
	///////////////////
	// Public Routes //
	///////////////////
	...getWebRoutes(),

	// Auth API
	route('/api/auth/*', './routes/auth.ts'),

	// Assets resource route
	route('assets/:assetId', './routes/assets/route.tsx'),

	///////////////
	// Dashboard //
	///////////////
	route('/dashboard/portal', './routes/auth/portal.tsx'),

	route('/dashboard', './routes/dashboard/layout/route.tsx', [
		index('./routes/dashboard/index/route.tsx'),

		// Dashboard API
		...prefix('api', []),

		// Assets
		...prefix('assets', [
			index('./routes/dashboard/assets/index.tsx'),
			route('resource', './routes/dashboard/assets/resource.ts'),
		]),

		// SEO
		...prefix('seo', [
			index('./routes/dashboard/seo/index.tsx'),
			route('resource', './routes/dashboard/seo/resource.ts'),
		]),

		// Account
		route('account', './routes/dashboard/account/layout.tsx', [
			index('./routes/dashboard/account/index/route.tsx'),
			route('billing', './routes/dashboard/account/billing/route.tsx'),
			route(
				'notification',
				'./routes/dashboard/account/notification/route.tsx',
			),
			route('security', './routes/dashboard/account/security/route.tsx'),
		]),

		// Company
		route('company', './routes/dashboard/company/layout.tsx', [
			index('./routes/dashboard/company/index/route.tsx'),
			route('billing', './routes/dashboard/company/billing/route.tsx'),
			route(
				'notification',
				'./routes/dashboard/company/notification/route.tsx',
			),
			route('security', './routes/dashboard/company/security/route.tsx'),
		]),

		route('user/resource', './routes/dashboard/user/resource.ts'),
		route('users', './routes/dashboard/user/users.tsx'),
		route('admins', './routes/dashboard/user/admins.tsx'),

		route('*', './routes/dashboard/$/route.tsx'),

		...getServicesDashboardRoutes(),
	]),
] satisfies RouteConfig
