import { getServiceDashboards } from './dashboard-registry'
import type { ServiceDashboard } from './type'

// Eagerly import service routes to ensure that they are registered in build time
import.meta.glob('../../routes/services/**/service.dashboard.{ts,tsx}', {
	eager: true,
})

/** Get dashboard configs from Service config */
export const getAllServiceDashboards = () => {
	const dashboards: ServiceDashboard[] = []

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, dashboard] of Object.entries(getServiceDashboards())) {
		try {
			if (!dashboard) continue

			dashboards.push(dashboard)
		} catch (error) {
			console.error(`Failed to load dashboard config from ${path}:`, error)
		}
	}

	return dashboards
}
