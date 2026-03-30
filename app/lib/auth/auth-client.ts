import {
	adminClient,
	emailOTPClient,
	organizationClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { ac, admin, user } from "./permissions"

export const authClient = createAuthClient({
	plugins: [
		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		// magicLinkClient(),
		emailOTPClient(),
		organizationClient({
			teams: {
				enabled: true,
			},
		}),
	],
})

export type Session = typeof authClient.$Infer.Session
