/**
 * @see https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
 */
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { S3 } from "~/lib/db/db.server"

/**
 * Generate a presigned URL for uploading a file to object storage
 * @param key - object key
 * @param size - File size in bytes
 * @param type - MIME type of the file
 * @param checksum - SHA256 checksum of the file
 * @returns string - Presigned URL
 */
export const getUploadPresignedURL = async ({
	key,
	size,
	type,
	checksum,
}: {
	key: string
	size: number
	type: string
	checksum: string
}) => {
	if (!S3) throw new Error("S3 client not initialized")

	try {
		// https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html
		const presignedUrl = await getSignedUrl(
			S3,
			new PutObjectCommand({
				Bucket: process.env.BUCKET_NAME || "papa",
				Key: key,
				ContentLength: size,
				ContentType: type,
				ChecksumSHA256: checksum,
			}),
			{ expiresIn: 300 },
		)
		return presignedUrl
	} catch (error) {
		throw new Error(`Presign url error: ${error}`)
	}
}

/**
 * Generate a presigned URL for downloading a file from object storage
 * @param key - object key
 * @returns string - Presigned URL
 */
export const getFileUrl = async (key: string) => {
	if (!S3) throw new Error("S3 client not initialized")

	try {
		const command = new GetObjectCommand({
			Bucket: process.env.BUCKET_NAME || "papa",
			Key: key,
		})
		const presignedUrl = await getSignedUrl(S3, command, { expiresIn: 300 })
		return presignedUrl
	} catch (error) {
		throw new Error(`Get file url error: ${error}`)
	}
}

/**
 * Please handle the error in the caller function
 * @param key - object key
 * @returns void
 */
export const deleteFile = async (key: string) => {
	if (!S3) throw new Error("S3 client not initialized")

	await S3.send(
		new DeleteObjectCommand({
			Bucket: process.env.BUCKET_NAME || "papa",
			Key: key,
		}),
	)
}
