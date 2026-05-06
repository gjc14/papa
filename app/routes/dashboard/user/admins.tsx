import type { Route } from "./+types/admins"
import { UserManagementRoute } from "~/components/dashboard/user-management/route-component"
import { getUsers } from "~/lib/db/user.server"

export const loader = async () => {
	return await getUsers({
		role: "admin",
	})
}

export default function Admins({ loaderData }: Route.ComponentProps) {
	const { users } = loaderData

	return <UserManagementRoute users={users} role="admin" />
}
