import { index, layout, prefix, route } from '@react-router/dev/routes'

import { getServiceRouteModules } from './routes-registry'

// Eagerly import service routes to ensure that they are registered in build time
import.meta.glob('../../routes/services/**/service.routes.{ts,tsx}', {
	eager: true,
})

/**
 * Get routes configured by `registerServiceRoutes()` in Services
 */
const getServicesRoutes = () => {
	const serviceRoutes = []

	// Extract dashboard routes from registered services
	for (const [path, service] of Object.entries(getServiceRouteModules())) {
		try {
			if (!service.routes) continue

			const routes = service.routes({
				index,
				route,
				prefix,
				layout,
			})

			if (Array.isArray(routes)) {
				serviceRoutes.push(...routes)
			}
		} catch (error) {
			console.error(`Failed to load routes from ${path}:`, error)
		}
	}

	return serviceRoutes
}

/**
 * Use `index(/)`, `splat(/*)`, `robots(/robots.txt)`, `sitemap(/sitemap.xml)` routes if no path matched in services' routes.
 */
const getWebRoutes = () => {
	const routes = getServicesRoutes()

	const SYSTEM_ROUTES = {
		'/': index('./routes/web/index.tsx'),
		'/*': route('/*', './routes/web/splat.tsx'),
		'/robots.txt': route('/robots.txt', './routes/web/robots.txt.ts'),
		'/sitemap.xml': route('/sitemap.xml', './routes/web/sitemap.xml.ts'),
	}

	console.log('Adding default routes (if not configured):')
	const paths = new Set(routes.map(r => r.path))

	for (const [k, v] of Object.entries(SYSTEM_ROUTES)) {
		const pathExists = paths.has(k)

		if (pathExists) {
			const matches = routes.flatMap(r => (r.path === k ? [r.file] : [])) // for type
			if (matches.length > 1) {
				console.log(`! [${k}](DUPLICATE): ${matches.join('; ')}`)
			} else {
				console.log(`= [${k}]: ${matches[0]}`)
			}
			continue
		} else {
			console.log(`+ [${k}]: ${v.file}`)
			routes.push(v)
		}
	}

	return routes
}

/** Get dashboard routes from Service config */
const getServicesDashboardRoutes = () => {
	const serviceRoutes = []

	// Extract dashboard routes from registered services
	for (const [path, service] of Object.entries(getServiceRouteModules())) {
		try {
			if (!service.dashboardRoutes) continue

			const routes = service.dashboardRoutes({
				index,
				route,
				prefix,
				layout,
			})

			if (Array.isArray(routes)) {
				serviceRoutes.push(...routes)
			}
		} catch (error) {
			console.error(`Failed to load routes from ${path}:`, error)
		}
	}

	return serviceRoutes
}

export { getServicesDashboardRoutes, getWebRoutes }
