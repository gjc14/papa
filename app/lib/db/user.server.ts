import { eq, inArray } from "drizzle-orm"
import { user as userTable } from "~/lib/db/schema"
import { db } from "./db.server"

type User = typeof userTable.$inferSelect

/**
 * Get users by cursor-based pagination
 * @param cursor the last record id of the previous page
 * @param pageSize number of records to fetch
 * @param direction direction of the pagination
 */
export const getUsers = async ({
	role = "user",
}: {
	role?: "admin" | "user"
} = {}): Promise<{
	users: User[]
}> => {
	const users = await db.query.user.findMany({
		where(fields, { eq }) {
			return eq(fields.role, role)
		},
	})

	return {
		users,
	}
}

export const updateUser = async (props: {
	id: string | string[]
	data: Partial<
		Omit<typeof userTable.$inferInsert, "id" | "createdAt" | "updatedAt">
	>
}): Promise<{ user: User[] }> => {
	const user = await db
		.update(userTable)
		.set(props.data)
		.where(
			Array.isArray(props.id)
				? inArray(userTable.id, props.id)
				: eq(userTable.id, props.id),
		)
		.returning()
	return { user }
}

export const deleteUser = async (
	ids: string | string[],
): Promise<{ user: User[] }> => {
	const user = await db
		.delete(userTable)
		.where(
			Array.isArray(ids) ? inArray(userTable.id, ids) : eq(userTable.id, ids),
		)
		.returning()
	return { user }
}
