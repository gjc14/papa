/**
 * @see https://www.better-auth.com/docs/plugins/admin#custom-permissions
 */
import { createAccessControl } from "better-auth/plugins/access"
import {
	adminAc,
	defaultStatements,
	userAc,
} from "better-auth/plugins/admin/access"

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
	...defaultStatements,
	post: ["create", "update", "delete"],
} as const

const ac = createAccessControl(statement)

// user and admin are default roles
const user = ac.newRole({
	...userAc.statements,
})

const admin = ac.newRole({
	...adminAc.statements,
	post: ["create", "update", "delete"],
})

export { ac, admin, user }
