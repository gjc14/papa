import type { SitemapURL } from '../utils/sitemap-to-xml'
import { getServiceSitemaps } from './sitemap-registry'

// Eagerly import service routes to ensure that they are registered in build time
import.meta.glob('../../routes/services/**/service.sitemap.{ts,tsx}', {
	eager: true,
})

/** Get the sitemap URLs from Service config */
const getAllServiceSitemapUrls = async (url: URL): Promise<SitemapURL[]> => {
	let rawUrls: SitemapURL[] = []

	console.log(`Processing service modules for sitemap URLs`)

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, sitemap] of Object.entries(getServiceSitemaps())) {
		console.log(`Processing service at ${path}`)
		try {
			if (!sitemap) continue

			rawUrls = rawUrls.concat(
				typeof sitemap === 'function' ? await sitemap(url) : sitemap,
			)
		} catch (error) {
			console.error(`Failed to load sitemap config from ${path}:`, error)
		}
	}

	return rawUrls.map(ru => ({
		...ru,
		loc: ru.loc.startsWith('/') // absolute
			? `${url.origin}${ru.loc}`
			: !ru.loc.startsWith(url.origin) // relative and not matching origin
				? `${url.origin}/${ru.loc}`
				: ru.loc,
		lastmod: ru.lastmod ?? new Date(),
	}))
}

export { getAllServiceSitemapUrls }
