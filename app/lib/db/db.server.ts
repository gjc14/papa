/**
 * Database
 */
import 'dotenv/config'

/**
 * Object Storage
 */
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined')
}

export const db = drizzle(process.env.DATABASE_URL, { schema })

export type TransactionType = Parameters<
	Parameters<(typeof db)['transaction']>[0]
>[0]

const ACCESS_KEY_ID = process.env.OBJECT_STORAGE_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY
const ACCOUNT_ID = process.env.OBJECT_STORAGE_ACCOUNT_ID

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !ACCOUNT_ID) {
	console.warn(
		`Object Storage: S3Client Missing ${
			!ACCESS_KEY_ID ? 'OBJECT_STORAGE_ACCESS_KEY_ID' : ''
		},
        ${!SECRET_ACCESS_KEY ? 'OBJECT_STORAGE_SECRET_ACCESS_KEY' : ''},
        ${!ACCOUNT_ID ? 'OBJECT_STORAGE_ACCOUNT_ID' : ''}
        `.replace(/\s+/g, ' '),
	)
}

export const S3 =
	ACCESS_KEY_ID && SECRET_ACCESS_KEY && ACCOUNT_ID
		? new S3Client({
				region: 'auto',
				endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: ACCESS_KEY_ID,
					secretAccessKey: SECRET_ACCESS_KEY,
				},
			})
		: null

if (S3) {
	S3.send(new ListBucketsCommand({})).then(result => {
		const isPapaExists = !!result.Buckets?.find(
			bucket => bucket.Name === (process.env.BUCKET_NAME ?? 'papa'),
		)
		if (!isPapaExists) {
			console.warn(
				`Bucket ${process.env.BUCKET_NAME ?? 'papa'} not found, please create it. Refer to ./README.md`,
			)
		}
	})
}
