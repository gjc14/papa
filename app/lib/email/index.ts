import "dotenv/config"

import { createEmailService } from "./service"

function requireEmailService() {
	const s = createEmailService()
	if (!s)
		throw new Error(
			"EmailService is not configured properly. Please check your environment variables and configuration.",
		)
	else return s
}

const emailService = requireEmailService()

export { EmailService } from "./service"
export type { EmailConfig, EmailOptions, EmailProvider } from "./types"
export { EmailProviderType } from "./types"
export { emailService }
