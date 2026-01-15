import type { RouteConfig } from '@react-router/dev/routes'
import { index, layout, prefix, route } from '@react-router/dev/routes'

import { getServiceRoutesModules } from './helpers'

/**
 * Check if a route path matches index, or splat patterns
 */
const isWebFallbackRoute = (routePath: string): boolean => {
	// Remove leading slash for consistent comparison
	const normalizedPath = routePath.replace(/^\//, '')

	// Check for index route (empty path or just '/')
	if (normalizedPath === '' || normalizedPath === '/') {
		return true
	}

	// Check for splat routes (catch-all)
	if (normalizedPath.includes('*') || normalizedPath === '$') {
		return true
	}

	// Check for SEO specific routes
	if (normalizedPath === 'robots.txt' || normalizedPath === 'sitemap.xml') {
		return true
	}

	return false
}

/**
 * Extract route paths from RouteConfig array, see type `RouteConfigEntry` under `RouteConfig`
 */
const extractRoutePaths = (routes: RouteConfig): string[] => {
	const paths: string[] = []

	if (Array.isArray(routes)) {
		for (const route of routes) {
			if (typeof route === 'object' && route !== null) {
				// Handle different route types from @react-router/dev/routes
				if ('path' in route && typeof route.path === 'string') {
					paths.push(route.path)
				}
				// For index routes, consider them as root '/'
				if ('index' in route && route.index === true) {
					paths.push('/')
				}
				// Handle nested routes
				if ('children' in route && Array.isArray(route.children)) {
					const childPaths = extractRoutePaths(route.children)
					const basePath = 'path' in route ? (route.path as string) : ''
					console.log(
						`Extracted child paths: ${JSON.stringify(childPaths, null, 2)} in parent ${basePath}`,
					)
					childPaths.forEach(childPath => {
						paths.push(`${basePath}/${childPath}`.replace(/\/+/g, '/'))
					})
				}
			}
		}
	}

	return paths
}

/**
 * Check if services have defined web fallback routes (index, splat)
 */
const hasWebRoutes = () => {
	const modules = getServiceRoutesModules()
	const webRouteTypes = {
		hasIndex: false,
		hasSplat: false,
		hasRobots: false,
		hasSitemap: false,
	}

	for (const [, service] of Object.entries(modules)) {
		if (!service.routes) continue

		const routePaths = extractRoutePaths(
			service.routes({
				index,
				layout,
				prefix,
				route,
			}),
		)
		console.log(`Service routes: ${JSON.stringify(routePaths, null, 2)}`)

		for (const path of routePaths) {
			if (isWebFallbackRoute(path)) {
				const normalizedPath = path.replace(/^\//, '')

				if (normalizedPath === '' || normalizedPath === '/') {
					webRouteTypes.hasIndex = true
				} else if (normalizedPath.includes('*') || normalizedPath === '$') {
					webRouteTypes.hasSplat = true
				} else if (normalizedPath === 'robots.txt') {
					webRouteTypes.hasRobots = true
				} else if (normalizedPath === 'sitemap.xml') {
					webRouteTypes.hasSitemap = true
				}
			}
		}
	}

	console.log(`Web route types: ${JSON.stringify(webRouteTypes, null, 2)}`)

	return webRouteTypes
}

/**
 * Get web fallback routes based on what services haven't defined
 * This function checks which web routes (index, splat) are not defined
 * by services and returns the appropriate fallback routes
 */
export const getWebFallbackRoutes = () => {
	const webRouteStatus = hasWebRoutes()

	return {
		shouldIncludeIndex: !webRouteStatus.hasIndex,
		shouldIncludeSplat: !webRouteStatus.hasSplat,
		shouldIncludeRobots: !webRouteStatus.hasRobots,
		shouldIncludeSitemap: !webRouteStatus.hasSitemap,
		status: webRouteStatus,
	}
}
