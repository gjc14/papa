import { layout, route, type RouteConfig } from '@react-router/dev/routes'

import { dashboardRoutes } from './routes/papa/dashboard/routes'
import {
	getWebFallbackRoutes,
	servicesRoutes,
} from './routes/papa/utils/service-configs'
import {
	indexRoute,
	robotsRoute,
	sitemapRoute,
	splatRoute,
} from './routes/web/papa.routes'

// Check what web routes need fallbacks
const webFallbacks = getWebFallbackRoutes()

// Build web routes array based on what's needed as fallback
const webRoutes: RouteConfig = []

if (webFallbacks.shouldIncludeIndex) {
	webRoutes.push(indexRoute())
}

if (webFallbacks.shouldIncludeSplat) {
	webRoutes.push(splatRoute())
}

if (webFallbacks.shouldIncludeRobots) {
	webRoutes.push(robotsRoute())
}

if (webFallbacks.shouldIncludeSitemap) {
	webRoutes.push(sitemapRoute())
}

const webRoutesConfig =
	webRoutes.length > 0 ? [layout('./routes/web/layout.tsx', webRoutes)] : []

export default [
	// Only add layout with web routes if we have any fallback routes needed
	...webRoutesConfig,

	// Auth API
	route('/api/auth/*', './routes/auth.ts'),

	// PAPA assets resource route
	route('assets/:assetId', './routes/papa/assets/route.tsx'),

	// Auth Page
	route('/dashboard/portal', './routes/papa/auth/portal.tsx'),

	// Dashboard route
	...dashboardRoutes(),

	// Service routes (dynamically loaded)
	...servicesRoutes(),
] satisfies RouteConfig
