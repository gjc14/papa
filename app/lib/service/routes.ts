import { index, layout, prefix, route } from '@react-router/dev/routes'

import { getServiceRouteModules } from './routes-registry'

// Eagerly import service routes to ensure that they are registered in build time
import.meta.glob('../../routes/services/**/service.routes.{ts,tsx}', {
	eager: true,
})

/** Get routes from Service config */
const getAllServiceRoutes = () => {
	const getAllServiceRoutes = []

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
				getAllServiceRoutes.push(...routes)
			}
		} catch (error) {
			console.error(`Failed to load routes from ${path}:`, error)
		}
	}

	return getAllServiceRoutes
}

/** Get dashboard routes from Service config */
const getAllServiceDashboardRoutes = () => {
	const getAllServiceRoutes = []

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
				getAllServiceRoutes.push(...routes)
			}
		} catch (error) {
			console.error(`Failed to load routes from ${path}:`, error)
		}
	}

	return getAllServiceRoutes
}

export { getAllServiceDashboardRoutes, getAllServiceRoutes }
