import { useState } from 'react'
import { useFetcher } from 'react-router'

import { ZodError } from 'zod'

import { useFetcherNotification } from '~/hooks/use-notification'
import type { FileMetadata } from '~/lib/db/schema'
import { isActionSuccess } from '~/lib/utils'
import {
	presignUrlResponseSchema,
	type PresignRequest,
} from '~/routes/papa/dashboard/assets/schema'

export type FileWithFileMetadata = FileMetadata & { file: File }

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#see_also
 */
export const MIMETypes = [
	'image',
	'video',
	'audio',
	'application',
	'model',
	'font',
	'text',
] as const

export const isMIMEType = (
	type: string,
): type is (typeof MIMETypes)[number] => {
	return MIMETypes.some(mimeType => type.startsWith(mimeType))
}

/**
 * Generate a role and type based storage key for the file, for example:
 * {userId}/asset/image/papa@ABCD-ddd0bbb-88ee-1234-8abc-c098765b1b1b
 * @param file pass in file type and file name
 * @param access role based authentication
 * @returns the key (path) of the file
 */
export const generateStorageKey = (file: File, userId: string) => {
	const fileType = file.type.split('/')[0]
	const uuid = crypto.randomUUID()
	return `${userId}/assets/${fileType}/${uuid}`
}

// Generate SHA-256 checksum for a file
async function generateChecksum(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer()
	const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
	return hashHex
}

export const assetResourceRoute = '/dashboard/assets/resource'

export type FileUploading = { file: File; key: string }

/**
 * Fetch the api to get presigned PUT URLs, and new metadata for the files
 * @param files - { File & { key: string }}[] - array of files with key
 * @returns { FileWithFileMetadata & { presignedUrl: string }}[] - array of file and metadata with presigned URL
 */
export const fetchPresignedPutUrls = async (
	files: FileUploading[],
): Promise<(FileWithFileMetadata & { presignedUrl: string })[]> => {
	try {
		const fileMetadataPromise = files.map(async ({ file, key }) => {
			const fileChecksum = await generateChecksum(file)
			const fileMetadata: PresignRequest[number] = {
				key: key,
				type: file.type,
				size: file.size,
				checksum: fileChecksum,
				filename: file.name,
			}
			return fileMetadata
		})

		const fileMetadata = await Promise.all(fileMetadataPromise)

		const postPresignedUrl = await fetch(assetResourceRoute, {
			method: 'POST',
			body: JSON.stringify(fileMetadata),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!postPresignedUrl.ok) {
			throw new Error(`HTTP error! status: ${postPresignedUrl.status}`)
		}

		const responsePayload = await postPresignedUrl.json()

		if (!isActionSuccess(responsePayload)) {
			throw new Error(responsePayload.err)
		}

		const presignedUrls = presignUrlResponseSchema.parse(responsePayload.data)

		// Update files with presigned URLs, and new id, updatedAt
		const updatedFiles = files.map(({ file, key }) => {
			const matched = presignedUrls.find(url => url.metadata.key === key)
			if (!matched) throw new Error('Presign data not found')
			const { metadata, presignedUrl } = matched
			return {
				file,
				...metadata,
				presignedUrl: presignedUrl,
			}
		})
		return updatedFiles
	} catch (error) {
		throw error
	}
}

// Types for upload progress tracking
type UploadProgress = {
	file: File
	progress: number
	status: 'pending' | 'uploading' | 'completed' | 'error'
	error?: string
}
export type UploadState = {
	[key: string]: UploadProgress
}

/**
 * Hook to get upload functions for files.
 * If you need more control over the upload process, refer to `oneStepUpload()`.
 */
export const useFileUpload = () => {
	const [uploadProgress, setUploadProgress] = useState<UploadState>({})
	const fetcher = useFetcher()
	useFetcherNotification(fetcher)

	const handleDelete = (key: string) => {
		fetcher.submit(JSON.stringify({ key }), {
			action: assetResourceRoute,
			method: 'DELETE',
			encType: 'application/json',
		})
	}

	const uploadSingleFile = async (
		file: FileWithFileMetadata & { presignedUrl: string },
	) => {
		return new Promise<void>((resolve, reject) => {
			const xhr = new XMLHttpRequest()

			// Track upload progress
			xhr.upload.onprogress = event => {
				if (event.lengthComputable) {
					const progress = Math.round((event.loaded / event.total) * 98)
					setUploadProgress(prev => ({
						...prev,
						[file.key]: {
							...prev[file.key],
							progress,
							status: 'uploading',
						},
					}))
				}
			}

			// Handle successful upload
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					setUploadProgress(prev => ({
						...prev,
						[file.key]: {
							...prev[file.key],
							progress: 100,
							status: 'completed',
						},
					}))
					resolve()
				} else {
					const error = `Upload failed with status ${xhr.status}`
					setUploadProgress(prev => ({
						...prev,
						[file.key]: {
							...prev[file.key],
							status: 'error',
							error,
						},
					}))
					handleDelete(file.key)
					reject(new Error(error))
				}
			}

			// Handle network errors
			xhr.onerror = () => {
				const error = 'Network error occurred'
				setUploadProgress(prev => ({
					...prev,
					[file.key]: {
						...prev[file.key],
						status: 'error',
						error,
					},
				}))
				handleDelete(file.key)
				reject(new Error(error))
			}

			// Open connection
			xhr.open('PUT', file.presignedUrl)

			// Set headers for CORS and content
			xhr.setRequestHeader('Content-Type', file.file.type)

			// Important: Set withCredentials to false for CORS with presigned URLs
			xhr.withCredentials = false

			xhr.send(file.file)
		})
	}

	const uploadSingleFileWithRetry = async (
		file: FileWithFileMetadata & { presignedUrl: string },
		retries = 3,
	): Promise<void> => {
		try {
			await uploadSingleFile(file)
		} catch (error) {
			if (retries > 0) {
				console.warn(
					`Retrying upload for ${file.name}, attempts left: ${retries}`,
				)
				return uploadSingleFileWithRetry(file, retries - 1)
			} else {
				console.error(`Upload failed for ${file.name}`, error)

				let errorMessage = 'Upload failed'
				if (error instanceof ZodError) {
					const errorMessages = error.errors.map(err => err.message).join('; ')
					errorMessage = `Validation error: ${errorMessages}.`
				} else if (error instanceof Error) {
					errorMessage = error.message
				}

				setUploadProgress(prev => ({
					...prev,
					[file.key]: {
						...prev[file.key],
						status: 'error',
						error: errorMessage,
					},
				}))
			}
		}
	}

	const uploadToPresignedUrl = async (
		files: (FileWithFileMetadata & { presignedUrl: string })[],
	) => {
		try {
			// Upload all files simultaneously
			const uploadPromises = files.map(file => uploadSingleFileWithRetry(file))
			await Promise.allSettled(uploadPromises)
		} catch (error) {
			console.error('Upload failed:', error)
		}
	}

	/**
	 * Prepare files for upload
	 * @param filesInput files from input or drop
	 * @param ownerId
	 * @returns files with generated storage keys
	 */
	const prepareFiles = (
		filesInput: File[],
		ownerId: string,
	): FileUploading[] => {
		return filesInput.map(file => ({
			file,
			key: generateStorageKey(file, ownerId),
		}))
	}

	/**
	 * After prepareFiles, initialize the upload process, setting given files to pending status
	 * @param newFiles files to be uploaded
	 */
	const initUploadProcess = (newFiles: FileUploading[]) => {
		// Initialize progress state for files (showing pending status)
		setUploadProgress(prev => {
			const initial = newFiles.reduce(
				(acc, { file, key }) => ({
					...acc,
					[key]: {
						file: file,
						progress: 0,
						status: 'pending' as const,
					},
				}),
				{},
			)
			return { ...prev, ...initial }
		})
	}

	/**
	 * @param filesInput files from input or drop
	 * @param ownerId
	 * @param onKeyGenerated optional callback when keys are generated, before presign request
	 * @returns when files are uploaded, with metadata and presigned URL
	 * 1. Generate key for file
	 * 2. Initialize upload progress state
	 * 3. Get presigned URLs
	 * 4. uploadToPresignedUrl via XML and track uploadProgress
	 */
	const oneStepUpload = async (
		filesInput: File[],
		ownerId: string,
		onSaveToDatabase?: (files: FileWithFileMetadata[]) => void,
	): Promise<(FileWithFileMetadata & { presignedUrl: string })[]> => {
		const preparedFiles = prepareFiles(filesInput, ownerId)
		initUploadProcess(preparedFiles)

		// Request to self
		let filesWithPresignedUrl
		try {
			// Now fetch presigned URLs (files will show as "pending" during this time), then upload
			filesWithPresignedUrl = await fetchPresignedPutUrls(preparedFiles)
		} catch (error) {
			console.error('Error fetching presigned URLs:', error)
			return []
		}

		onSaveToDatabase?.(filesWithPresignedUrl)

		// Request to presigned URLs
		await uploadToPresignedUrl(filesWithPresignedUrl)
		return filesWithPresignedUrl
	}

	return {
		uploadProgress,
		prepareFiles,
		initUploadProcess,
		uploadToPresignedUrl,
		oneStepUpload,
	}
}
