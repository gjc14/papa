import { NodemailerProvider } from "./providers/nodemailer"
import { ResendProvider } from "./providers/resend"
import { SESProvider } from "./providers/ses"
import {
	EmailProviderType,
	type EmailConfig,
	type EmailOptions,
	type EmailProvider,
} from "./types"

export class EmailService {
	private provider: EmailProvider
	private defaultFrom: string

	constructor(config: EmailConfig) {
		this.defaultFrom = config.defaultFrom
		this.provider = this.createProvider(config)
	}

	private createProvider(config: EmailConfig): EmailProvider {
		switch (config.provider) {
			case EmailProviderType.RESEND:
				if (!config.config.resendApiKey) {
					throw new Error("Resend API key is required")
				}

				return new ResendProvider(config.config.resendApiKey)

			case EmailProviderType.NODEMAILER:
			case EmailProviderType.SMTP:
				if (!config.config.host || !config.config.user || !config.config.pass) {
					throw new Error("Nodemailer configuration is incomplete")
				}

				return new NodemailerProvider({
					host: config.config.host,
					port: config.config.port || 587,
					secure: config.config.secure || false,
					user: config.config.user,
					pass: config.config.pass,
				})

			case EmailProviderType.SES:
				if (!config.config.region) {
					throw new Error("AWS SES region is required")
				}

				return new SESProvider({
					region: config.config.region,
					accessKeyId: config.config.accessKeyId,
					secretAccessKey: config.config.secretAccessKey,
				})

			default:
				throw new Error(`Unsupported email provider: ${config.provider}`)
		}
	}

	async send(
		options: Omit<EmailOptions, "from"> & { from?: string },
	): Promise<void> {
		const emailOptions: EmailOptions = {
			...options,
			from: options.from || this.defaultFrom,
		}

		await this.provider.send(emailOptions)
	}

	// Convenience method: send email with React component, posibly built with @react-email
	async sendReactEmail(options: {
		to: string | string[]
		subject: string
		react: React.ReactElement
		from?: string
	}): Promise<void> {
		await this.send({
			to: options.to,
			subject: options.subject,
			react: options.react,
			from: options.from,
		})
	}

	// Convenience method: send plain text email
	async sendTextEmail(options: {
		to: string | string[]
		subject: string
		text: string
		from?: string
	}): Promise<void> {
		await this.send({
			to: options.to,
			subject: options.subject,
			text: options.text,
			from: options.from,
		})
	}

	// Convenience method: send HTML email
	async sendHtmlEmail(options: {
		to: string | string[]
		subject: string
		html: string
		from?: string
	}): Promise<void> {
		await this.send({
			to: options.to,
			subject: options.subject,
			html: options.html,
			from: options.from,
		})
	}
}

export function createEmailService(): EmailService | null {
	// Determine the email provider from environment variables
	const provider =
		(process.env.EMAIL_PROVIDER as EmailProviderType) ||
		EmailProviderType.RESEND

	// TODO: deprecate AUTH_EMAIL in favor of EMAIL_FROM
	const emailFrom = process.env.EMAIL_FROM || process.env.AUTH_EMAIL

	if (!emailFrom) {
		console.warn("EMAIL_FROM environment variable is required")
		return null
	}

	try {
		let config: EmailConfig

		switch (provider) {
			case EmailProviderType.RESEND:
				if (!process.env.RESEND_API_KEY) {
					console.warn("RESEND_API_KEY is required for Resend provider")
					return null
				}
				config = {
					provider: EmailProviderType.RESEND,
					config: {
						resendApiKey: process.env.RESEND_API_KEY,
					},
					defaultFrom: emailFrom,
				}
				break

			case EmailProviderType.NODEMAILER:
			case EmailProviderType.SMTP:
				if (
					!process.env.SMTP_HOST ||
					!process.env.SMTP_USER ||
					!process.env.SMTP_PASS
				) {
					console.warn(
						"SMTP_HOST, SMTP_USER, and SMTP_PASS are required for Nodemailer provider",
					)
					return null
				}
				config = {
					provider: EmailProviderType.NODEMAILER,
					config: {
						host: process.env.SMTP_HOST,
						port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
						secure: process.env.SMTP_SECURE === "true",
						user: process.env.SMTP_USER,
						pass: process.env.SMTP_PASS,
					},
					defaultFrom: emailFrom,
				}
				break

			case EmailProviderType.SES:
				if (!process.env.AWS_SES_REGION) {
					console.warn("AWS_SES_REGION is required for SES provider")
					return null
				}
				config = {
					provider: EmailProviderType.SES,
					config: {
						region: process.env.AWS_SES_REGION,
						accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
						secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
					},
					defaultFrom: emailFrom,
				}
				break

			default:
				console.warn(`Unsupported email provider: ${provider || "unknown"}`)
				return null
		}

		return new EmailService(config)
	} catch (error) {
		console.error("Failed to create email service:", error)
		return null
	}
}

export type { EmailConfig, EmailOptions, EmailProvider, EmailProviderType }
