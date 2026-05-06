import type { Route } from "./+types/users"
import { UserManagementRoute } from "~/components/dashboard/user-management/route-component"
import { getUsers } from "~/lib/db/user.server"

export const loader = async () => {
	return await getUsers({
		role: "user",
	})
}

export default function Users({ loaderData }: Route.ComponentProps) {
	const { users } = loaderData

	return <UserManagementRoute users={users} role="user" />
}
