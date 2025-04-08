/**
 * This auth module is dedicated to the admin panel.
 */
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin as adminPlugin, magicLink } from 'better-auth/plugins'

import { db } from '~/lib/db/db.server'
import { emailInstance } from '../utils/email'
import { ac, admin, user } from './permissions'
import { sendMagicLink } from './utils'

const appName = process.env.APP_NAME ?? 'PAPA'
const baseURL = process.env.VITE_BASE_URL ?? 'http://localhost:5173'

export const auth = betterAuth({
	appName,
	baseURL,
	database: drizzleAdapter(db, {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: false,
	},
	plugins: [
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		...(emailInstance
			? [
					magicLink({
						sendMagicLink: async ({ email, token, url }, request) => {
							sendMagicLink({
								email,
								url,
								token,
								emailInstance: emailInstance!,
							})
						},
						disableSignUp: true,
					}),
			  ]
			: []),
	],
	advanced: {
		cookiePrefix: 'papa',
	},
})
