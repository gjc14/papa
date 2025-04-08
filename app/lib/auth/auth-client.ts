import { adminClient, magicLinkClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { ac, admin, user } from './permissions'

export const authClient = createAuthClient({
	plugins: [
		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		magicLinkClient(),
	],
})
