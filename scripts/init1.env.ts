/**
 * Check required environment variables
 */
import "dotenv/config"
import { checkEnv } from "./init.utils"

async function init() {
	console.log("1. Checking required environment variables...")

	console.log("❓ Database")
	if (!checkEnv("DATABASE_URL")) process.exit(1)
	console.log("✅ Database")

	// Object Storage
	console.log("\n❓ Object Storage")
	if (
		!checkEnv("OBJECT_STORAGE_ACCOUNT_ID") ||
		!checkEnv("OBJECT_STORAGE_ACCESS_KEY_ID") ||
		!checkEnv("OBJECT_STORAGE_SECRET_ACCESS_KEY")
	) {
		console.warn(
			`-> Make sure you have added \`OBJECT_STORAGE_ACCOUNT_ID\`, \`OBJECT_STORAGE_ACCESS_KEY_ID\`, and \`OBJECT_STORAGE_SECRET_ACCESS_KEY\` to \`.env\` file.  To initialize, run \`cp env.example .env\` in the root directory of the project to copy the example file.`,
		)
		return process.exit(1)
	}

	if (!checkEnv("BUCKET_NAME")) process.exit(1)

	console.log("✅ Object Storage")

	// Email
	console.log("\n❓ Email Service")
	try {
		await import("~/lib/email")
	} catch (error: unknown) {
		console.warn("-> Supported email services: Nodemailer, AWS SES, Resend.")

		if (error instanceof Error) {
			console.error(`${error.message}`)
		}
		process.exit(1)
	}

	console.log("✅ Email Service")

	process.exit(0)
}

init()
