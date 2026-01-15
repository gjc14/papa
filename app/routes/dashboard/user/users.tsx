import type { Route } from './+types/users'

import { getUsers } from '~/lib/db/user.server'

import { UserManagementRoute } from '~/components/dashboard/user-management/route-component'

export const loader = async () => {
	return await getUsers({
		role: 'user',
	})
}

export default function Users({ loaderData }: Route.ComponentProps) {
	const { users } = loaderData

	return <UserManagementRoute users={users} role="user" />
}
