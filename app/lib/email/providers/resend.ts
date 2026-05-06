import { Resend } from "resend"
import type { EmailOptions, EmailProvider } from "../types"

export class ResendProvider implements EmailProvider {
	private resend: Resend

	constructor(apiKey: string) {
		this.resend = new Resend(apiKey)
	}
	async send(options: EmailOptions): Promise<void> {
		try {
			// Resend supports either React components OR HTML/text, but not both
			if (options.react) {
				// Use React component
				const { error } = await this.resend.emails.send({
					from: options.from,
					to: Array.isArray(options.to) ? options.to : [options.to],
					subject: options.subject,
					react: options.react,
				})

				if (error) {
					console.error("Resend error:", error)
					throw new Error(`Failed to send email via Resend: ${error.message}`)
				}
			} else {
				// Use HTML/text content
				const { error } = await this.resend.emails.send({
					from: options.from,
					to: Array.isArray(options.to) ? options.to : [options.to],
					subject: options.subject,
					html: options.html,
					text: options.text,
					react: undefined,
				})

				if (error) {
					console.error("Resend error:", error)
					throw new Error(`Failed to send email via Resend: ${error.message}`)
				}
			}
		} catch (error) {
			console.error("Error sending email via Resend:", error)
			throw error
		}
	}
}
