import type { SitemapURL } from '../to-xml-url-tags'
import { getServiceRoutesModules } from './helpers'

/**
 * Get the sitemap URLs from Service config
 */
export const getSitemapUrls = (url: URL): SitemapURL[] => {
	const modules = getServiceRoutesModules()
	let urls: SitemapURL[] = []

	console.log(`Processing service modules for sitemap URLs`)

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, service] of Object.entries(modules)) {
		console.log(`Processing service at ${path}`)
		try {
			if (!service.sitemap) continue

			urls = urls.concat(
				typeof service.sitemap === 'function'
					? service.sitemap(url)
					: service.sitemap,
			)
		} catch (error) {
			console.error(`Failed to load sitemap config from ${path}:`, error)
		}
	}

	return urls
}

/**
 * Routes that posts prefix
 * @default ["/blog"] // if not set. e.g. /blog/:postId
 */
export const getBlogPrefixes = (): string[] => {
	const modules = getServiceRoutesModules()
	let blogs: string[] = []

	console.log(`Processing service modules for blog URLs`)

	/**
	 * Automatically includes all service routes without manual imports
	 */
	for (const [path, service] of Object.entries(modules)) {
		console.log(`Processing service at ${path}`)
		try {
			if (!service.blogUrls) continue
			blogs = service.blogUrls
		} catch (error) {
			console.error(`Failed to load sitemap config from ${path}:`, error)
		}
	}

	return blogs.length === 0 ? ['/blog'] : blogs
}
