export interface EmailOptions {
	from: string
	to: string | string[]
	subject: string
	html?: string
	text?: string
	react?: React.ReactElement
}

export interface EmailProvider {
	send(options: EmailOptions): Promise<void>
}

export const EmailProviderType = {
	RESEND: "resend",
	NODEMAILER: "nodemailer",
	SMTP: "smtp",
	SES: "ses",
} as const

export type EmailProviderType =
	(typeof EmailProviderType)[keyof typeof EmailProviderType]

export interface EmailConfig {
	provider: EmailProviderType
	config: {
		// Resend
		resendApiKey?: string

		// Nodemailer
		host?: string
		port?: number
		secure?: boolean
		user?: string
		pass?: string

		// AWS SES
		region?: string
		accessKeyId?: string
		secretAccessKey?: string
	}
	defaultFrom: string
}

export const isEmailProviderType = (
	value: string,
): value is EmailProviderType =>
	Object.values(EmailProviderType).includes(value as EmailProviderType)
