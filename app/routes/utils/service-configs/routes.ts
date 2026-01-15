import {
	index,
	layout,
	prefix,
	route,
	type RouteConfig,
} from '@react-router/dev/routes'

import { getServiceRoutesModules } from './helpers'

export const servicesRoutes = () => {
	const modules = getServiceRoutesModules()
	const servicesRoutes: RouteConfig = []

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, service] of Object.entries(modules)) {
		try {
			if (!service.routes) continue

			const routes = service.routes({
				index,
				route,
				prefix,
				layout,
			})

			if (Array.isArray(routes)) {
				servicesRoutes.push(...routes)
			}
		} catch (error) {
			console.error(`Failed to load routes from ${path}:`, error)
		}
	}

	return servicesRoutes
}

export const servicesDashboardRoutes = () => {
	const modules = getServiceRoutesModules()
	const servicesRoutes: RouteConfig = []

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, service] of Object.entries(modules)) {
		try {
			if (!service.dashboard?.routes) continue

			const routes = service.dashboard.routes({
				index,
				route,
				prefix,
				layout,
			})

			if (Array.isArray(routes)) {
				servicesRoutes.push(...routes)
			}
		} catch (error) {
			console.error(`Failed to load routes from ${path}:`, error)
		}
	}

	return servicesRoutes
}
