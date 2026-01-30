/**
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt?hl=zh-tw
 */
import type { Route } from './+types/robots.txt'

export const loader = ({ request }: Route.LoaderArgs) => {
	const url = new URL(request.url)
	const robotText = `
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/

Crawl-delay: 30

Sitemap: ${url.origin}/sitemap.xml
`.trim()

	return new Response(robotText, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain',
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}
