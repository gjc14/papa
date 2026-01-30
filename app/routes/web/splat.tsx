/**
 * Where will match all routes that are not matched by other routes.
 * This is a catch-all route, not a resource route nor a redirect route.
 */
import type { Route } from './+types/splat'

export function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const href = url.href
	throw new Response(href, { status: 404 })
}

export default function NotFoundRoute() {
	return null
}
