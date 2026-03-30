/**
 * Check required environment variables
 */
import "dotenv/config"

import { emailService } from "~/lib/email"

function checkDatabaseUrl(): boolean {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		console.warn(
			"\n⚠️ PostgreSQL DATABASE_URL is not set. Please set this to enable Papa. Path: `./.env`",
		)
		console.warn(
			"-> Add DATABASE_URL=your-url to the `.env` file in the root directory of the project.",
		)
		return false
	}

	console.log("✅ DATABASE_URL is set")
	return true
}

function checkObjectStorage(): boolean {
	const accountId = process.env.OBJECT_STORAGE_ACCOUNT_ID
	const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID
	const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY

	if (!accountId || !accessKeyId || !secretAccessKey) {
		console.warn(
			"\n⚠️ Cloudflare R2 object storage setup is not complete. Please set OBJECT_STORAGE_ACCOUNT_ID, OBJECT_STORAGE_ACCESS_KEY_ID, and OBJECT_STORAGE_SECRET_ACCESS_KEY environment variables to enable object storage functionality",
		)
		console.warn(
			"-> Add these variables to the `.env` file in the root directory of the project. You can create API tokens in Cloudflare dashboard > R2 Object Storage > API > Manage API Tokens",
		)
		return false
	}

	// Check if BUCKET_NAME is set, if not, use 'papa' as default
	if (!process.env.BUCKET_NAME) {
		process.env.BUCKET_NAME = "papa"
		console.log('⚠️ BUCKET_NAME is not set, using default value "papa"')
	} else {
		console.log(`✅ BUCKET_NAME is set to "${process.env.BUCKET_NAME}"`)
	}

	console.log("✅ Cloudflare R2 object storage is set correctly")
	return true
}

function checkEmail(): boolean {
	if (!emailService) {
		console.warn(
			"\n⚠️ Email setup is not complete, you must provide EMAIL_FROM and corresponding email service configuration environment variables to enable email functionality",
		)
		console.warn("\n-> Supported email services: Nodemailer, AWS SES, Resend.")
		return false
	}

	console.log("✅ Email sending system is set correctly")
	return true
}

async function init() {
	console.log("🚀 Initializing the app...")

	if (!checkDatabaseUrl()) {
		process.exit(1)
	}
	if (!checkObjectStorage()) {
		process.exit(1)
	}
	if (!checkEmail()) {
		process.exit(1)
	}
}

init()
