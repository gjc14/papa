import { getEnv } from "env"
import { NodemailerProvider } from "./providers/nodemailer"
import { ResendProvider } from "./providers/resend"
import { SESProvider } from "./providers/ses"
import {
	type EmailConfig,
	type EmailOptions,
	type EmailProvider,
	EmailProviderType,
	isEmailProviderType,
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

export function createEmailService(): EmailService {
	// Determine the email provider from environment variables
	const providerEnv = getEnv("EMAIL_PROVIDER")
	const provider = isEmailProviderType(providerEnv)
		? providerEnv
		: EmailProviderType.SMTP // default to SMTP (Nodemailer)

	const emailFrom = getEnv("EMAIL_FROM")

	if (!emailFrom) {
		throw new Error("EMAIL_FROM environment variable is required")
	}

	try {
		let config: EmailConfig

		switch (provider) {
			case EmailProviderType.RESEND:
				if (!getEnv("RESEND_API_KEY")) {
					throw new Error("RESEND_API_KEY is required for Resend provider")
				}
				config = {
					provider: EmailProviderType.RESEND,
					config: {
						resendApiKey: getEnv("RESEND_API_KEY"),
					},
					defaultFrom: emailFrom,
				}
				break

			case EmailProviderType.NODEMAILER:
			case EmailProviderType.SMTP:
				if (
					!getEnv("SMTP_HOST") ||
					!getEnv("SMTP_USER") ||
					!getEnv("SMTP_PASS")
				) {
					throw new Error(
						"SMTP_HOST, SMTP_USER, and SMTP_PASS are required for Nodemailer provider",
					)
				}
				config = {
					provider: EmailProviderType.NODEMAILER,
					config: {
						host: getEnv("SMTP_HOST"),
						port: parseInt(getEnv("SMTP_PORT"), 10) || 587,
						secure: getEnv("SMTP_SECURE") === "true" || true,
						user: getEnv("SMTP_USER"),
						pass: getEnv("SMTP_PASS"),
					},
					defaultFrom: emailFrom,
				}
				break

			case EmailProviderType.SES:
				if (
					!getEnv("AWS_SES_REGION") ||
					!getEnv("AWS_SES_ACCESS_KEY_ID") ||
					!getEnv("AWS_SES_SECRET_ACCESS_KEY")
				) {
					throw new Error(
						"AWS_SES_REGION, AWS_SES_ACCESS_KEY_ID, and AWS_SES_SECRET_ACCESS_KEY are required for SES provider",
					)
				}
				config = {
					provider: EmailProviderType.SES,
					config: {
						region: getEnv("AWS_SES_REGION"),
						accessKeyId: getEnv("AWS_SES_ACCESS_KEY_ID"),
						secretAccessKey: getEnv("AWS_SES_SECRET_ACCESS_KEY"),
					},
					defaultFrom: emailFrom,
				}
				break

			default:
				throw new Error(`Unsupported email provider: ${provider || "unknown"}`)
		}

		return new EmailService(config)
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw error
		} else {
			throw new Error("Unknown error occurred while creating EmailService")
		}
	}
}

export type { EmailConfig, EmailOptions, EmailProvider, EmailProviderType }
