/**
 * This auth module is dedicated to the dashboard.
 */
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import {
	admin as adminPlugin,
	emailOTP,
	organization,
} from "better-auth/plugins"

import { db } from "~/lib/db/db.server"

import { emailService } from "../email"
import { ac, admin, user } from "./permissions"
import {
	sendSignInOTP,
	sendVerifyChangeEmailLink,
	sendVerifyLink,
} from "./utils"

const appName = process.env.APP_NAME || "PAPA"
const baseURL =
	process.env.NODE_ENV === "production"
		? process.env.VITE_BASE_URL || "http://localhost:5173"
		: "http://localhost:5173"

const otpExpireIn = 60 * 5 // 5 minutes

export const auth = betterAuth({
	appName,
	baseURL,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: false,
	},
	emailVerification: {
		/**
		 * User will automatically be verified and signed up if they are new to the app.
		 * Please look for "Sign in with OTP" section in the documentation.
		 * @see https://www.better-auth.com/docs/plugins/email-otp#sign-in-with-otp
		 */
		...(emailService
			? {
					sendVerificationEmail: async ({ user, url, token }, request) => {
						await sendVerifyLink({
							email: user.email,
							token: token,
							url: url,
							emailService: emailService!,
						})
					},
				}
			: {}),
	},
	user: {
		/**
		 * User should verify change with current email.
		 * After verification, 1) email will be changed, meanwhile, 2) another verification email will be sent to the new email.
		 * @see https://www.better-auth.com/docs/concepts/users-accounts#change-email
		 */
		changeEmail: {
			enabled: true,
			...(true
				? {
						sendChangeEmailVerification: async (
							{ user, newEmail, url, token },
							request,
						) => {
							await sendVerifyChangeEmailLink({
								email: user.email, // verification email must be sent to the current user email to approve the change
								newEmail,
								url,
								token,
								emailService: emailService!,
							})
						},
					}
				: {}),
		},
	},

	plugins: [
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		...(emailService
			? [
					// magicLink({
					// 	sendMagicLink: async ({ email, token, url }, request) => {
					// 		sendMagicLink({
					// 			email,
					// 			url,
					// 			token,
					// 			emailService: emailService!,
					// 		})
					// 	},
					// 	disableSignUp: true,
					// }),
					emailOTP({
						expiresIn: otpExpireIn, // 5 minutes
						async sendVerificationOTP({ email, otp, type }) {
							console.log("sendVerificationOTP", email, otp, type)
							switch (type) {
								case "sign-in":
									await sendSignInOTP({
										email,
										otp,
										expireIn: otpExpireIn,
										emailService: emailService!,
									})
									break
								case "email-verification":
									console.warn("Email verification not implemented")
									break
								case "forget-password":
									console.warn("Forget password not implemented")
									break
							}
						},
					}),
				]
			: []),
		organization({
			async sendInvitationEmail({
				email,
				inviter: { user, role },
				organization: { name, logo },
			}) {
				// await sendInvitationEmail()
			},
			teams: {
				enabled: true,
				maximumTeams: async ({ organizationId, session }, request) => {
					// Check plan
					return 2
				},
				allowRemovingAllTeams: false,
			},
			membershipLimit: 1000 * 1000,
		}),
	],
	advanced: {
		cookiePrefix: appName,
	},
})

export type Session = typeof auth.$Infer.Session
