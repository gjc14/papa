import type { Resend } from 'resend'

import MagicLinkEmail from '~/components/email/magic-link'
import OtpEmail from '~/components/email/otp-email'
import WelcomeEmail from '~/components/email/welcome-email'
import type { EmailService } from '~/lib/utils/email/service'

export const sendMagicLink = async ({
	email,
	url,
	token,
	emailInstance,
	emailService,
}: {
	email: string
	url: string
	token: string
	emailInstance?: Resend
	emailService?: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME ?? 'PAPA'
	const from = `🪄${appName} Magic Link <${process.env.AUTH_EMAIL}>`

	if (emailService) {
		await emailService.sendReactEmail({
			from,
			to: email,
			subject: '點擊魔法連結以登入您的帳號！Click the link to sign in',
			react: MagicLinkEmail({ magicLink: url }),
		})
	} else if (emailInstance) {
		const { error } = await emailInstance.emails.send({
			from,
			to: [email],
			subject: '點擊魔法連結以登入您的帳號！Click the link to sign in',
			react: MagicLinkEmail({ magicLink: url }),
		})
		if (error) {
			console.error(error)
			throw new Error('Error when sending magic link email')
		}
	} else {
		throw new Error('No email service available')
	}
}

export const sendVerifyLink = async ({
	email,
	url,
	token,
	emailInstance,
	emailService,
}: {
	email: string
	url: string
	token: string
	emailInstance?: Resend
	emailService?: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME ?? 'PAPA'
	const from = `🔓${appName} Verify <${process.env.AUTH_EMAIL}>`

	if (emailService) {
		await emailService.sendReactEmail({
			from,
			to: email,
			subject: '點擊連結以驗證您的帳號！Click the link to verify your email',
			react: WelcomeEmail({
				appName: appName,
				logoUrl: process.env.VITE_BASE_URL + '/logo.png',
				userFirstname: email.split('@')[0],
				verifyLink: url,
			}),
		})
	} else if (emailInstance) {
		const { error } = await emailInstance.emails.send({
			from,
			to: [email],
			subject: '點擊連結以驗證您的帳號！Click the link to verify your email',
			react: WelcomeEmail({
				appName: appName,
				logoUrl: process.env.VITE_BASE_URL + '/logo.png',
				userFirstname: email.split('@')[0],
				verifyLink: url,
			}),
		})
		if (error) {
			console.error(error)
			throw new Error('Error when sending verify link email')
		}
	} else {
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
	emailInstance,
	emailService,
}: {
	email: string
	otp: string
	expireIn: number
	emailInstance?: Resend
	emailService?: EmailService
}): Promise<void> => {
	const appName = process.env.APP_NAME ?? 'PAPA'
	const from = `${appName} <${process.env.AUTH_EMAIL}>`

	if (emailService) {
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
	} else if (emailInstance) {
		const { error } = await emailInstance.emails.send({
			from,
			to: [email],
			subject: `[${otp}] 是您的 OTP，輸入以登入 ${appName}！Enter your OTP to sign in ${appName}`,
			react: OtpEmail({
				otp,
				expireIn,
				companyName: appName,
				username: email.split('@')[0],
			}),
		})
		if (error) {
			console.error(error)
			throw new Error('Error when sending magic link email')
		}
	} else {
		throw new Error('No email service available')
	}
}
