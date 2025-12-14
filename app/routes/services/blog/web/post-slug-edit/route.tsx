import type { Route } from './+types/route'
import { redirect } from 'react-router'

export const loader = async ({ params }: Route.LoaderArgs) => {
	return redirect('/dashboard/blog/' + params.postSlug)
}
