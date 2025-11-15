import 'dotenv/config'

import {
	CreateBucketCommand,
	ListBucketsCommand,
	PutBucketCorsCommand,
	S3Client,
} from '@aws-sdk/client-s3'

import { initLocale, t } from './i18n'

/**
 * Check required environment variables
 */
function checkRequiredEnvVars(): boolean {
	// Set default bucket name if not provided
	if (!process.env.BUCKET_NAME) {
		process.env.BUCKET_NAME = 'papa'
		console.log(t('bucket-name-not-set', { default: 'papa' }))
	}

	const requiredVars = [
		'OBJECT_STORAGE_ACCOUNT_ID',
		'OBJECT_STORAGE_ACCESS_KEY_ID',
		'OBJECT_STORAGE_SECRET_ACCESS_KEY',
		'VITE_BASE_URL',
	]

	let allPresent = true
	requiredVars.map(varName => {
		if (!process.env[varName]) {
			console.error(t('missing-required-env', { varName }))
			allPresent = false
		}
	})

	if (!allPresent) {
		console.error(t('set-all-required-env'))
		return false
	}

	console.log(t('all-required-env-set'))
	return true
}

/**
 * Initialize S3 client
 */
async function initS3Client() {
	console.log(t('initializing-s3-client'))

	// Configure the S3 client to point to Cloudflare R2
	const s3Client = new S3Client({
		region: 'auto', // R2 uses 'auto' as the region
		endpoint: `https://${process.env.OBJECT_STORAGE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY_ID ?? '',
			secretAccessKey: process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY ?? '',
		},
	})

	try {
		const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}))
		console.log(
			t('s3-client-connected', {
				count: String(listBucketsResponse.Buckets?.length || 0),
			}),
		)
		return { s3Client, listBucketsResponse }
	} catch (error) {
		console.error(t('s3-client-connection-failed'), error)
		process.exit(1)
	}
}

/**
 * Create R2 bucket
 */
async function createBucket(s3Client: S3Client, bucketName: string) {
	try {
		console.log(t('creating-bucket', { name: bucketName }))
		const command = new CreateBucketCommand({ Bucket: bucketName })
		const response = await s3Client.send(command)
		console.log(t('bucket-created-successfully', { name: bucketName }))
		return response
	} catch (error: any) {
		// If the bucket already exists with that name but owned by you, this is fine
		if (error.name === 'BucketAlreadyOwnedByYou') {
			console.log(t('bucket-already-owned', { name: bucketName }))
			return { BucketAlreadyExists: true }
		}

		console.error(t('error-creating-bucket'), error)
		throw error
	}
}

/**
 * Set CORS configuration for bucket
 */
async function setBucketCors(s3Client: S3Client, bucketName: string) {
	console.log(t('setting-cors', { name: bucketName }))

	// Parse VITE_BASE_URL to include in allowed origins
	const allowedOrigins = ['http://localhost:5173']

	if (process.env.VITE_BASE_URL) {
		// Remove trailing slash if present
		const baseUrl = process.env.VITE_BASE_URL.endsWith('/')
			? process.env.VITE_BASE_URL.slice(0, -1)
			: process.env.VITE_BASE_URL
		allowedOrigins.push(baseUrl)
	}

	const corsConfig = {
		Bucket: bucketName,
		CORSConfiguration: {
			CORSRules: [
				{
					AllowedOrigins: allowedOrigins,
					AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
					AllowedHeaders: ['*'],
					ExposeHeaders: ['ETag'],
					MaxAgeSeconds: 3000,
				},
			],
		},
	}

	try {
		const command = new PutBucketCorsCommand(corsConfig)
		const response = await s3Client.send(command)
		console.log(
			t('cors-set-successfully', {
				origins: allowedOrigins.join(', '),
			}),
		)
		return response
	} catch (error) {
		console.error(t('error-setting-cors'), error)
		throw error
	}
}

/**
 * Setup bucket with CORS configuration
 */
async function setupBucketWithCors(
	s3Client: S3Client,
	bucketName: string,
	existingBuckets: string[],
) {
	try {
		// Check if bucket already exists
		if (existingBuckets.includes(bucketName)) {
			console.log(t('bucket-already-exists-skip', { name: bucketName }))
		} else {
			await createBucket(s3Client, bucketName)
		}

		// Set CORS configuration regardless of whether the bucket was just created or already existed
		await setBucketCors(s3Client, bucketName)

		console.log(t('bucket-configured', { name: bucketName }))
	} catch (error) {
		console.error(t('error-setting-up-bucket'), error)
		process.exit(1)
	}
}

/**
 * Main function: Initialize storage
 */
async function initStorage(locale?: string) {
	await initLocale(locale)
	console.log(t('init-storage-starting'))

	if (!checkRequiredEnvVars()) {
		process.exit(1)
	}

	const bucketName = process.env.BUCKET_NAME || 'papa'
	const { s3Client, listBucketsResponse } = await initS3Client()

	// Extract existing bucket names
	const existingBuckets = (listBucketsResponse.Buckets || []).map(
		bucket => `- ${bucket.Name || ''}`,
	)
	const bucketsDisplay =
		existingBuckets.length > 0 ? existingBuckets.join('\n') : 'none'
	console.log(t('existing-buckets', { buckets: bucketsDisplay }))

	// Setup bucket with CORS
	await setupBucketWithCors(s3Client, bucketName, existingBuckets)

	console.log(t('storage-init-completed'))
}

// Run the initialization
const locale = process.argv[2]
initStorage(locale)
