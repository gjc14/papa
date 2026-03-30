import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"
import { render } from "@react-email/render"

import type { EmailOptions, EmailProvider } from "../types"

export class SESProvider implements EmailProvider {
	private sesClient: SESClient

	constructor(config: {
		region: string
		accessKeyId?: string
		secretAccessKey?: string
	}) {
		this.sesClient = new SESClient({
			region: config.region,
			credentials:
				config.accessKeyId && config.secretAccessKey
					? {
							accessKeyId: config.accessKeyId,
							secretAccessKey: config.secretAccessKey,
						}
					: undefined, // Using default credentials if not provided
		})
	}

	async send(options: EmailOptions): Promise<void> {
		try {
			let html = options.html

			if (options.react) {
				html = await render(options.react)
			}

			const command = new SendEmailCommand({
				Source: options.from,
				Destination: {
					ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
				},
				Message: {
					Subject: {
						Data: options.subject,
						Charset: "UTF-8",
					},
					Body: {
						Html: html
							? {
									Data: html,
									Charset: "UTF-8",
								}
							: undefined,
						Text: options.text
							? {
									Data: options.text,
									Charset: "UTF-8",
								}
							: undefined,
					},
				},
			})

			await this.sesClient.send(command)
		} catch (error) {
			console.error("Error sending email via AWS SES:", error)
			throw new Error(`Failed to send email via AWS SES: ${error}`)
		}
	}
}
