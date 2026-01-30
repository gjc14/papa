import { getServiceDashboards } from './dashboard-registry'
import type { ServiceDashboard } from './type'

// Eagerly import service routes to ensure that they are registered in build time
import.meta.glob('../../routes/services/**/service.dashboard.{ts,tsx}', {
	eager: true,
})

/** Get dashboard configs from Service config */
export const getServicesDashboards = () => {
	let dashboards: ServiceDashboard[] = []

	/**
	 * Automatically includes all service dashboards without manual imports
	 */
	for (const [index, dashboard] of Object.entries(getServiceDashboards())) {
		try {
			dashboards.push(dashboard)
		} catch (error) {
			console.error(
				`Failed to load dashboard config #${index}. ${dashboard}`,
				error,
			)
		}
	}

	return dashboards
}
