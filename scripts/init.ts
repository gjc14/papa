/**
 * Init check required environment variables
 */
import 'dotenv/config'

import { emailInstance } from '~/lib/utils/email'

function checkDatabaseUrl(): boolean {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		console.warn(
			'\n⚠️ PostgreSQL DATABASE_URL 未設定。請設定以啟用 Papa。路徑: `./.env` (PostgreSQL DATABASE_URL is not set. Please set this to enable Papa. Path: `./.env`)',
		)
		console.warn(
			'設定方法: 在專案根目錄的 `.env` 檔案中加入 DATABASE_URL=您的URL (How to set: Add DATABASE_URL=your-url to the `.env` file in the root directory of the project.)',
		)
		return false
	}

	console.log('✅ DATABASE_URL 已設定 (DATABASE_URL is set)')
	return true
}

function checkObjectStorage(): boolean {
	const accountId = process.env.OBJECT_STORAGE_ACCOUNT_ID
	const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID
	const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY

	if (!accountId || !accessKeyId || !secretAccessKey) {
		console.warn(
			'\n⚠️ Cloudflare R2 物件存儲設定尚未完成。請設定 OBJECT_STORAGE_ACCOUNT_ID、OBJECT_STORAGE_ACCESS_KEY_ID 以及 OBJECT_STORAGE_SECRET_ACCESS_KEY 環境變數以啟用物件存儲功能 (Cloudflare R2 object storage setup is not complete. Please set OBJECT_STORAGE_ACCOUNT_ID, OBJECT_STORAGE_ACCESS_KEY_ID, and OBJECT_STORAGE_SECRET_ACCESS_KEY environment variables to enable object storage functionality)',
		)
		console.warn(
			'設定方法: 在專案根目錄的 `.env` 檔案中加入這些變數。您可以在 Cloudflare Dashboard > R2 Object Storage > {} API > Manage API Tokens 中創建 API Token (How to set: Add these variables to the `.env` file in the root directory of the project. You can create API tokens in Cloudflare dashboard > R2 Object Storage > API > Manage API Tokens)',
		)
		return false
	}

	// Check if BUCKET_NAME is set, if not, use 'papa' as default
	if (!process.env.BUCKET_NAME) {
		process.env.BUCKET_NAME = 'papa'
		console.log(
			'⚠️ BUCKET_NAME 未設定，將使用預設值 "papa" (BUCKET_NAME is not set, using default value "papa")',
		)
	} else {
		console.log(
			`✅ BUCKET_NAME 已設定為 "${process.env.BUCKET_NAME}" (BUCKET_NAME is set to "${process.env.BUCKET_NAME}")`,
		)
	}

	console.log(
		'✅ Cloudflare R2 物件存儲設定正確 (Cloudflare R2 object storage is set correctly)',
	)
	return true
}

function checkResendApiKey(): boolean {
	if (!emailInstance) {
		console.warn(
			'\n⚠️ Email 設定尚未完成，您必須提供 AUTH_EMAIL 以及 RESEND_API_KEY 環境變數以啟用 Email 功能 (Email setup is not complete, you must provide AUTH_EMAIL and RESEND_API_KEY environment variables to enable email functionality)',
		)
		console.warn(
			'\n您可以從 https://resend.com 獲取 API 金鑰。(You can get the API key from https://resend.com.)',
		)
	}

	console.log('✅ Email 設定正確 (Email is set correctly)')
	return true
}

async function init() {
	console.log('🚀 初始化 Papa 應用程式... (Initializing Papa app...)')

	if (!checkDatabaseUrl()) {
		process.exit(1)
	}
	if (!checkObjectStorage()) {
		process.exit(1)
	}
	if (!checkResendApiKey()) {
		process.exit(1)
	}
}

init()
