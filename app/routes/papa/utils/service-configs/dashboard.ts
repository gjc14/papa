import type { ServiceDashboardConfig } from '../../../../components/dashboard/service-swicher'
import type { DashboardMenuItem } from '../../dashboard/layout/components/dashboard-sidebar/nav-menu'
import { getServiceRoutesModules } from './helpers'

/**
 * Type guard to check if an item is a valid DashboardMenuItem
 */
const isDashboardMenuItem = (item: unknown): item is DashboardMenuItem => {
	const hasTitlePathname = (
		item: any,
	): item is { title: string; pathname: string } & {
		[key: string]: unknown
	} => {
		return (
			typeof item === 'object' &&
			item !== null &&
			typeof item.title === 'string' &&
			typeof item.pathname === 'string'
		)
	}

	if (!hasTitlePathname(item) || !item.icon) {
		// Parent sidebar item must have icon
		return false
	}

	// Check sub sidebar if it exists
	if (item.sub !== undefined) {
		if (!Array.isArray(item.sub)) {
			return false
		}

		for (const subItem of item.sub) {
			if (!hasTitlePathname(subItem)) {
				return false
			}
		}
	}

	return true
}

/**
 * Helper function to parse the dashboard configuration
 */
const parseDashboardConfigs = (
	config: any,
): ServiceDashboardConfig & {
	sidebar?: DashboardMenuItem[]
} => {
	if (typeof config !== 'object' || config === null) {
		throw new Error('Invalid config type, expected an object')
	}

	if (typeof config.name !== 'string') {
		throw new Error('Invalid config name, expected a string')
	}

	if (config.description && typeof config.description !== 'string') {
		throw new Error('Invalid config description, expected a string')
	}

	if (typeof config.logo !== 'string' && !config.logo) {
		throw new Error(
			'Invalid config logo, expected a string or a React ElementType',
		)
	}

	if (typeof config.pathname !== 'string') {
		throw new Error('Invalid config pathname, expected a string')
	}

	if (config.sidebar !== undefined) {
		if (
			!Array.isArray(config.sidebar) ||
			!config.sidebar.every(isDashboardMenuItem)
		) {
			throw new Error(
				'Invalid config sidebar, expected an array of DashboardMenuItem',
			)
		}
	}

	return {
		name: config.name,
		description: config.description,
		logo: config.logo,
		pathname: config.pathname,
		sidebar: config.sidebar,
	}
}

/**
 * Get all available service dashboard configurations including sidebar
 */
export const getServiceDashboardConfigs = () => {
	const modules = getServiceRoutesModules()
	const dashboardConfigs: (ServiceDashboardConfig & {
		sidebar?: DashboardMenuItem[]
	})[] = []

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, service] of Object.entries(modules)) {
		try {
			if (!service.dashboard) continue

			const config = parseDashboardConfigs(service.dashboard)
			dashboardConfigs.push(config)
		} catch (error) {
			console.error(`Failed to load dashboard config from ${path}:`, error)
		}
	}

	return dashboardConfigs
}
