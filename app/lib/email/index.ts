import "dotenv/config"

import { createEmailService } from "./service"

export const emailService = createEmailService()
export { EmailService } from "./service"
export type { EmailConfig, EmailOptions, EmailProvider } from "./types"
export { EmailProviderType } from "./types"
