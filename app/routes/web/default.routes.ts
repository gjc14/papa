import { index, route } from '@react-router/dev/routes'

export const indexRoute = () => {
	return index('./routes/web/index/route.tsx')
}

export const splatRoute = () => {
	return route('/*', './routes/web/$/route.tsx')
}

export const robotsRoute = () => {
	return route('/robots.txt', './routes/web/_robots.txt.ts')
}

export const sitemapRoute = () => {
	return route('/sitemap.xml', './routes/web/_sitemap.xml.ts')
}
