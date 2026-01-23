import type { ServiceSitemap } from './type'

const Sitemaps: ServiceSitemap[] = []

export const registerServiceSitemap = (s: ServiceSitemap) => {
	Sitemaps.push(s)
}

export const getServiceSitemaps = () => Sitemaps
