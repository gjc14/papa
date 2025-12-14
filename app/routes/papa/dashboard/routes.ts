import {
	index,
	prefix,
	route,
	type RouteConfig,
} from '@react-router/dev/routes'

import { servicesDashboardRoutes } from '../utils/service-configs'

export const dashboardRoutes = () =>
	[
		route('/dashboard', './routes/papa/dashboard/layout/route.tsx', [
			index('./routes/papa/dashboard/index/route.tsx'),

			// Dashboard API
			...prefix('api', []),

			// Assets
			...prefix('assets', [
				index('./routes/papa/dashboard/assets/index.tsx'),
				route('resource', './routes/papa/dashboard/assets/resource.ts'),
			]),

			// SEO
			...prefix('seo', [
				index('./routes/papa/dashboard/seo/index.tsx'),
				route('resource', './routes/papa/dashboard/seo/resource.ts'),
			]),

			// Account
			route('account', './routes/papa/dashboard/account/layout.tsx', [
				index('./routes/papa/dashboard/account/index/route.tsx'),
				route('billing', './routes/papa/dashboard/account/billing/route.tsx'),
				route(
					'notification',
					'./routes/papa/dashboard/account/notification/route.tsx',
				),
				route('security', './routes/papa/dashboard/account/security/route.tsx'),
			]),

			// Company
			route('company', './routes/papa/dashboard/company/layout.tsx', [
				index('./routes/papa/dashboard/company/index/route.tsx'),
				route('billing', './routes/papa/dashboard/company/billing/route.tsx'),
				route(
					'notification',
					'./routes/papa/dashboard/company/notification/route.tsx',
				),
				route('security', './routes/papa/dashboard/company/security/route.tsx'),
			]),

			route('user/resource', './routes/papa/dashboard/user/resource.ts'),
			route('users', './routes/papa/dashboard/user/users.tsx'),
			route('admins', './routes/papa/dashboard/user/admins.tsx'),

			route('*', './routes/papa/dashboard/$/route.tsx'),

			...servicesDashboardRoutes(),
		]),
	] satisfies RouteConfig
