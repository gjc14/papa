import 'dotenv/config'

import {
	CreateBucketCommand,
	ListBucketsCommand,
	PutBucketCorsCommand,
	S3Client,
} from '@aws-sdk/client-s3'

/**
 * Check required environment variables
 */
function checkRequiredEnvVars(): boolean {
	// Set default bucket name if not provided
	if (!process.env.BUCKET_NAME) {
		process.env.BUCKET_NAME = 'papa'
		console.log(
			'⚠️ BUCKET_NAME 未設定，將使用預設值 "papa" (BUCKET_NAME is not set, using default value "papa")',
		)
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
			console.error(
				`❌ 缺少必要環境變數: ${varName} (Missing required environment variable: ${varName})`,
			)
			allPresent = false
		}
	})

	if (!allPresent) {
		console.error(
			'請設定所有必要的環境變數再重試 (Please set all required environment variables and try again)',
		)
		return false
	}

	console.log(
		'✅ 所有必要環境變數已設定 (All required environment variables are set)',
	)
	return true
}

/**
 * Initialize S3 client
 */
async function initS3Client() {
	console.log('🔄 正在初始化 S3 客戶端... (Initializing S3 client...)')

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
			`✅ S3 客戶端連接成功，找到 ${listBucketsResponse.Buckets?.length || 0} 個存儲桶 (S3 client connected successfully, found ${listBucketsResponse.Buckets?.length || 0} buckets)`,
		)
		return { s3Client, listBucketsResponse }
	} catch (error) {
		console.error('❌ S3 客戶端連接失敗 (S3 client connection failed):', error)
		process.exit(1)
	}
}

/**
 * Create R2 bucket
 */
async function createBucket(s3Client: S3Client, bucketName: string) {
	try {
		console.log(
			`🔄 正在創建存儲桶: ${bucketName}... (Creating bucket: ${bucketName}...)`,
		)
		const command = new CreateBucketCommand({ Bucket: bucketName })
		const response = await s3Client.send(command)
		console.log(
			`✅ 存儲桶創建成功: ${bucketName} (Bucket created successfully: ${bucketName})`,
		)
		return response
	} catch (error: any) {
		// If the bucket already exists with that name but owned by you, this is fine
		if (error.name === 'BucketAlreadyOwnedByYou') {
			console.log(
				`⚠️ 存儲桶已存在且歸您所有: ${bucketName} (Bucket already exists and is owned by you: ${bucketName})`,
			)
			return { BucketAlreadyExists: true }
		}

		console.error(
			`❌ 創建存儲桶失敗: ${error} (Error creating bucket: ${error})`,
		)
		throw error
	}
}

/**
 * Set CORS configuration for bucket
 */
async function setBucketCors(s3Client: S3Client, bucketName: string) {
	console.log(
		`🔄 正在為存儲桶設置 CORS 設定: ${bucketName}... (Setting CORS configuration for bucket: ${bucketName}...)`,
	)

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
			`✅ CORS 設置成功，允許的來源: ${allowedOrigins.join(', ')} (CORS configuration set successfully, allowed origins: ${allowedOrigins.join(', ')})`,
		)
		return response
	} catch (error) {
		console.error(
			`❌ 設置 CORS 設定失敗: ${error} (Error setting CORS configuration: ${error})`,
		)
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
			console.log(
				`⚠️ 存儲桶 ${bucketName} 已存在，跳過創建步驟 (Bucket ${bucketName} already exists, skipping creation step)`,
			)
		} else {
			await createBucket(s3Client, bucketName)
		}

		// Set CORS configuration regardless of whether the bucket was just created or already existed
		await setBucketCors(s3Client, bucketName)

		console.log(
			`✅ 存儲桶 ${bucketName} 已設定完成 (Bucket ${bucketName} has been configured successfully)`,
		)
	} catch (error) {
		console.error(
			`❌ 設置存儲桶失敗: ${error} (Error setting up bucket: ${error})`,
		)
		process.exit(1)
	}
}

/**
 * Main function: Initialize admin storage
 */
async function initAdminStorage() {
	console.log('🚀 初始化 R2 物件存儲... (Initializing R2 object storage...)')

	if (!checkRequiredEnvVars()) {
		process.exit(1)
	}

	const bucketName = process.env.BUCKET_NAME || 'papa'
	const { s3Client, listBucketsResponse } = await initS3Client()

	// Extract existing bucket names
	const existingBuckets = (listBucketsResponse.Buckets || []).map(
		bucket => bucket.Name || '',
	)
	console.log(
		`📋 現有存儲桶: ${existingBuckets.join(', ') || '無'} (Existing buckets: ${existingBuckets.join(', ') || 'none'})`,
	)

	// Setup bucket with CORS
	await setupBucketWithCors(s3Client, bucketName, existingBuckets)

	console.log(
		'✅ R2 物件存儲初始化完成 (R2 object storage initialization completed)',
	)
}

// Run the initialization
initAdminStorage().catch(error => {
	console.error('❌ 初始化過程中發生錯誤 (Error during initialization):', error)
	process.exit(1)
})
