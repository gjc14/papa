import { render } from "@react-email/render"
import * as nodemailer from "nodemailer"
import type { EmailOptions, EmailProvider } from "../types"

export class NodemailerProvider implements EmailProvider {
	private transporter: nodemailer.Transporter

	constructor(config: {
		host: string
		port: number
		secure: boolean
		user: string
		pass: string
	}) {
		this.transporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: config.secure,
			auth: {
				user: config.user,
				pass: config.pass,
			},
		})
	}

	async send(options: EmailOptions): Promise<void> {
		try {
			let html = options.html

			if (options.react) {
				html = await render(options.react)
			}

			await this.transporter.sendMail({
				from: options.from,
				to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
				subject: options.subject,
				html,
				text: options.text,
			})
		} catch (error) {
			console.error("Error sending email via Nodemailer:", error)
			throw new Error(`Failed to send email via Nodemailer: ${error}`)
		}
	}

	// Verify the connection to the SMTP server
	async verify(): Promise<boolean> {
		try {
			await this.transporter.verify()
			return true
		} catch (error) {
			console.error("Nodemailer connection verification failed:", error)
			return false
		}
	}
}
