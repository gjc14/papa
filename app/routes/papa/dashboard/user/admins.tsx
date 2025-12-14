import type { Route } from './+types/admins'

import { getUsers } from '~/lib/db/user.server'

import { UserManagementRoute } from '../../../../components/dashboard/user-management/route-component'

export const loader = async () => {
	return await getUsers({
		role: 'admin',
	})
}

export default function Admins({ loaderData }: Route.ComponentProps) {
	const { users } = loaderData

	return <UserManagementRoute users={users} role="admin" />
}
