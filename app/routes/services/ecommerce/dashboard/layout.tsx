import type { Route } from './+types/layout'
import { Outlet } from 'react-router'

export default function ECLayout({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	return <Outlet />
}
