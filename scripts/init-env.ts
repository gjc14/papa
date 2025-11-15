/**
 * Init check required environment variables
 */
import 'dotenv/config'

import { emailService } from '~/lib/email'

import { initLocale, t } from './i18n'

function checkDatabaseUrl(): boolean {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		console.log(t('database-url-not-set'))
		console.log(t('database-url-how-to-set'))
		return false
	}

	console.log(t('database-url-set'))
	return true
}

function checkObjectStorage(): boolean {
	const accountId = process.env.OBJECT_STORAGE_ACCOUNT_ID
	const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID
	const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY

	if (!accountId || !accessKeyId || !secretAccessKey) {
		console.log(t('object-storage-not-complete'))
		console.log(t('object-storage-how-to-set'))
		return false
	}

	// Check if BUCKET_NAME is set, if not, use 'papa' as default
	if (!process.env.BUCKET_NAME) {
		process.env.BUCKET_NAME = 'papa'
		console.log(t('bucket-name-not-set', { default: 'papa' }))
	} else {
		console.log(t('bucket-name-set', { name: process.env.BUCKET_NAME }))
	}

	console.log(t('object-storage-set-correctly'))
	return true
}

function checkResendApiKey(): boolean {
	if (!emailService) {
		console.log(t('email-setup-not-complete'))
		console.log(t('email-supported-services'))
		return false
	}

	console.log(t('email-set-correctly'))
	return true
}

async function initEnv(locale?: string) {
	await initLocale(locale)
	console.log(t('init-starting'))

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

const locale = process.argv[2]
initEnv(locale)
