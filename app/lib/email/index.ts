import "dotenv/config"

import { createEmailService } from "./service"

const emailService = createEmailService()

export { emailService }

export type { EmailConfig, EmailOptions, EmailProvider } from "./types"
export { EmailProviderType } from "./types"
export { EmailService } from "./service"
