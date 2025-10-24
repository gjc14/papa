import MagicLinkEmail from '~/components/email/magic-link'
import OtpEmail from '~/components/email/otp-email'
import VerifyChangeEmail from '~/components/email/verify-change-email'
import WelcomeEmail from '~/components/email/welcome-email'
import type { EmailService } from '~/lib/email/service'

import { getEmailAddressFromENV } from '../email/utils'

export const sendMagicLink = async ({
	email,
	url,
	token,
	emailService,
}: {
	email: string
	url: string
	token: string
	emailService: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME || 'PAPA'
	const from = `🪄${appName} Magic Link <${getEmailAddressFromENV()}>`

	try {
		await emailService.sendReactEmail({
			from,
			to: email,
			subject: '點擊魔法連結以登入您的帳號！Click the link to sign in',
			react: MagicLinkEmail({ magicLink: url }),
		})
	} catch (error) {
		console.error('Error when sending magic link email', error)
		throw new Error('No email service available')
	}
}

export const sendVerifyLink = async ({
	email,
	url,
	token,
	emailService,
}: {
	email: string
	url: string
	token: string
	emailService: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME || 'PAPA'
	const from = `🔓${appName} Verify <${getEmailAddressFromENV()}>`

	try {
		await emailService.sendReactEmail({
			from,
			to: email,
			subject: '點擊連結以驗證您的帳號！Click the link to verify your email',
			react: WelcomeEmail({
				appName: appName,
				logoUrl:
					(process.env.NODE_ENV === 'production'
						? process.env.VITE_BASE_URL || 'http://localhost:5173'
						: 'http://localhost:5173') + '/logo.png',
				userFirstname: email.split('@')[0],
				verifyLink: url,
			}),
		})
	} catch (error) {
		console.error('Error when sending verify link email', error)
		throw new Error('No email service available')
	}
}

/**
 * This email will be sent to the current user email to approve the change.
 * After verification, another email will be sent to the new email address to verify the change.
 * @see https://www.better-auth.com/docs/concepts/users-accounts#change-email
 */
export const sendVerifyChangeEmailLink = async ({
	email,
	newEmail,
	url,
	token,
	emailService,
}: {
	email: string
	newEmail: string
	url: string
	token: string
	emailService: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME || 'PAPA'
	const from = `🔓${appName} Verify <${getEmailAddressFromENV()}>`

	try {
		await emailService.sendReactEmail({
			from,
			to: email,
			subject: '點擊連結以確認更改您的 Email 至 ' + newEmail,
			react: VerifyChangeEmail({
				appName: appName,
				logoUrl:
					(process.env.NODE_ENV === 'production'
						? process.env.VITE_BASE_URL || 'http://localhost:5173'
						: 'http://localhost:5173') + '/logo.png',
				userFirstname: email.split('@')[0],
				verifyLink: url,
				newEmail,
			}),
		})
	} catch (error) {
		console.error('Error when sending verify change email link', error)
		throw new Error('No email service available')
	}
}

/**
 * Send the OTP to the user's email address
 */
export const sendSignInOTP = async ({
	email,
	otp,
	expireIn,
	emailService,
}: {
	email: string
	otp: string
	expireIn: number
	emailService: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME || 'PAPA'
	const from = `${appName} <${getEmailAddressFromENV()}>`

	try {
		await emailService.sendReactEmail({
			from,
			to: email,
			subject: `[${otp}] 是您的 OTP，輸入以登入 ${appName}！Enter your OTP to sign in ${appName}`,
			react: OtpEmail({
				otp,
				expireIn,
				companyName: appName,
				username: email.split('@')[0],
			}),
		})
	} catch (error) {
		console.error('Error when sending OTP email', error)
		throw new Error('No email service available')
	}
}
