import { registerServiceSitemap } from '~/lib/service/sitemap-registry'

registerServiceSitemap(url => [
	{
		loc: `${url.origin}/store`,
		lastmod: new Date(),
		changefreq: 'daily',
		priority: 0.8,
	},
	{
		loc: '/store/123',
		lastmod: new Date(),
		changefreq: 'weekly',
		priority: 0.5,
	},
])
