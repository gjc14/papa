import { getSystemEndpoints } from './system-endpoints-registry'
import type { RobotsConfig, SitemapUrlConfig } from './utils'

// Eagerly import service routes to ensure that they are registered in build time
import.meta.glob('../../routes/services/**/service.system-endpoints.{ts,tsx}', {
	eager: true,
})

const systemEndpoints = getSystemEndpoints()

/** Get the sitemap URLs from Service config */
const getServiceSitemapUrlConfigs = async (
	url: URL,
): Promise<SitemapUrlConfig[]> => {
	let urlConfigs: SitemapUrlConfig[] = []

	/**
	 * Automatically includes all service sitemap urls without manual imports
	 */
	for (const [index, sitemap] of Object.entries(
		systemEndpoints.flatMap(s => (s.sitemap ? [s.sitemap] : [])),
	)) {
		try {
			urlConfigs = urlConfigs.concat(
				typeof sitemap === 'function' ? await sitemap(url) : sitemap,
			)
		} catch (error) {
			console.error(
				`Failed to load sitemap config #${index}. ${sitemap}`,
				error,
			)
		}
	}

	return urlConfigs.map(ru => ({
		...ru,
		loc: ru.loc.startsWith('/') // absolute
			? `${url.origin}${ru.loc}`
			: !ru.loc.startsWith(url.origin) // relative and not matching origin
				? `${url.origin}/${ru.loc}`
				: ru.loc,
		lastmod: ru.lastmod ?? new Date(),
	}))
}

/** Get the robots txt from Service config */
const getServiceRobotsConfigs = async (url: URL): Promise<RobotsConfig[]> => {
	let robotsConfigs: RobotsConfig[] = []

	/**
	 * Automatically includes all service robots.txt string without manual imports
	 */
	for (const [index, robots] of Object.entries(
		systemEndpoints.flatMap(s => (s.robots ? [s.robots] : [])),
	)) {
		try {
			robotsConfigs.push(
				typeof robots === 'function' ? await robots(url) : robots,
			)
		} catch (error) {
			console.error(`Failed to load robots config #${index}. ${robots}`, error)
		}
	}

	return robotsConfigs
}

export { getServiceSitemapUrlConfigs, getServiceRobotsConfigs }
