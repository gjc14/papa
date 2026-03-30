/**
 * `EMAIL_FROM` accept formats like:
 * - "Example Name <example@example.com>"
 * - "example@email.com"
 * @returns The email address
 */
export const getEmailAddressFromENV = (): string => {
	const emailRegex = /<([^>]+)>/

	const emailFrom = process.env.EMAIL_FROM || process.env.AUTH_EMAIL || ""

	const match = emailFrom.match(emailRegex)

	if (!match) {
		return emailFrom.trim()
	}

	return match[1].trim()
}
