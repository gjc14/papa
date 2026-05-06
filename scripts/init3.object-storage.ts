import "dotenv/config"

import {
	CreateBucketCommand,
	HeadBucketCommand,
	PutBucketCorsCommand,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3"
import { type EnvKey, getEnv } from "env"
import { checkEnv } from "./init.utils"

/**
 * Check required environment variables
 */
function checkRequiredEnvVars() {
	// Set default bucket name if not provided
	if (!checkEnv("BUCKET_NAME"))
		throw new Error("Missing required environment variable: BUCKET_NAME")

	const requiredVars: EnvKey[] = [
		"OBJECT_STORAGE_ACCOUNT_ID",
		"OBJECT_STORAGE_ACCESS_KEY_ID",
		"OBJECT_STORAGE_SECRET_ACCESS_KEY",
		"VITE_BASE_URL",
	]

	let exists = true

	for (const varName of requiredVars) {
		if (!checkEnv(varName)) {
			exists = false
		}
	}

	if (!exists) {
		throw new Error(
			"Missing required environment variables for object storage.",
		)
	}
}

/**
 * Initialize S3 client
 */
async function initS3Client() {
	// Configure the S3 client to point to Cloudflare R2

	// TODO: add full support for other S3-compatible providers
	const s3Client = new S3Client({
		region: "auto",
		endpoint: `https://${getEnv("OBJECT_STORAGE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: getEnv("OBJECT_STORAGE_ACCESS_KEY_ID"),
			secretAccessKey: getEnv("OBJECT_STORAGE_SECRET_ACCESS_KEY"),
		},
	})

	console.log("✅ S3 client initialized successfully.")
	return s3Client
}

/**
 * Create bucket
 */
async function createBucket(s3Client: S3Client, bucketName: string) {
	const bucketExists = await s3Client.send(
		new HeadBucketCommand({
			Bucket: bucketName,
		}),
	)

	if (bucketExists.$metadata.httpStatusCode === 200) {
		console.log(`✅ Bucket \`${bucketName}\` exists, skipping creation step.`)
	} else {
		console.log(` - Bucket \`${bucketName}\` does not exist, creating...`)

		await s3Client.send(
			new CreateBucketCommand({
				Bucket: bucketName,
			}),
		)
		console.log(`✅ Bucket created successfully: ${bucketName}`)
	}
}

/**
 * Setup bucket with CORS configuration
 */
async function setupBucketWithCors(s3Client: S3Client, bucketName: string) {
	// Set CORS configuration regardless of whether the bucket was just created or already existed
	console.log(` - Setting CORS configuration for bucket: ${bucketName}...`)

	// Parse VITE_BASE_URL to include in allowed origins
	const allowedOrigins = ["http://localhost:5173"]

	let baseUrl = getEnv("VITE_BASE_URL")
	if (baseUrl) {
		// Remove trailing slash if present
		baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
		allowedOrigins.push(baseUrl)
	}

	const corsConfig = {
		Bucket: bucketName,
		CORSConfiguration: {
			CORSRules: [
				{
					AllowedOrigins: allowedOrigins,
					AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
					AllowedHeaders: ["*"],
					ExposeHeaders: ["ETag"],
					MaxAgeSeconds: 3000,
				},
			],
		},
	}

	await s3Client.send(new PutBucketCorsCommand(corsConfig))
	console.log(
		`✅ CORS configuration for bucket \`${bucketName}\` set successfully, allowed origins: ${allowedOrigins.join(", ")}`,
	)
}

/**
 * Main function: Initialize storage
 */
async function main() {
	console.log("–––––\n\n3. Initializing Object Storage...")

	console.log("\n3.1 Checking required environment variables...")
	checkRequiredEnvVars()

	console.log("\n3.2 Initializing S3 client...")
	const s3Client = await initS3Client()

	const bucketName = getEnv("BUCKET_NAME")

	console.log("\n3.3 Creating bucket if it doesn't exist...")
	await createBucket(s3Client, bucketName)

	console.log("\n3.4 Setting up bucket with CORS configuration...")
	await setupBucketWithCors(s3Client, bucketName)

	console.log("\n✅ Object Storage initialization completed.")
}

// Run the initialization
main()
	.catch((error: unknown) => {
		if (error instanceof S3ServiceException) {
			console.error(
				`❌ S3 Error: ${error.name}: ${error.message}. ${JSON.stringify(error)}`,
			)
		} else if (error instanceof Error) {
			console.error(`❌ ${error.name}: ${error.message}`)
		} else {
			console.error(
				`❌ Unknown error occurred while initializing object storage: ${error}`,
			)
		}
		process.exit(1)
	})
	.finally(() => process.exit(0))
