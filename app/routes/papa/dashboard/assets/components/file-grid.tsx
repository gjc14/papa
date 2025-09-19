import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { CloudUploadIcon, CupSoda } from 'lucide-react'
import { ZodError } from 'zod'

import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { authClient } from '~/lib/auth/auth-client'
import type { FileMetadata } from '~/lib/db/schema'
import { cn } from '~/lib/utils'

import type { FileUploading, UploadState } from '../utils'
import {
	fetchPresignedPutUrls,
	generateStorageKey,
	useFileUpload,
} from '../utils'
import { FileCard } from './file-card'
import { ProgressCard } from './progress-card'

export interface FileGridProps {
	files: FileMetadata[]
	origin: string
	onFileSelect?: (file: FileMetadata) => void
	onFileUpdate?: (fileMeta: FileMetadata) => void
	onFileDeleted?: (file: FileMetadata) => void
	dialogTrigger?: React.ReactNode
	onUpload?: (files: FileMetadata[]) => void
}

/**
 * @param dialogTrigger - Add trigger button as children to use FileGrid as Dialog
 * @param onFileSelect - Callback when file is selected
 */
export const FileGrid = (props: FileGridProps) => {
	if (!props.dialogTrigger) {
		return <FileGridMain {...props} />
	} else if (props.dialogTrigger) {
		const [open, setOpen] = useState(false)
		const [visuallySelected, setVisuallySelected] =
			useState<FileMetadata | null>(null)

		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{props.dialogTrigger}</DialogTrigger>
				<DialogContent className="max-h-[90vh] max-w-xl min-w-[50vw] overflow-scroll">
					<DialogHeader className="h-fit">
						<DialogTitle>Assets</DialogTitle>
						<DialogDescription className="flex w-full grow items-center">
							Manage gallery, select or upload assets here.
							<Button
								className="ml-auto"
								disabled={!visuallySelected}
								onClick={() => {
									if (!visuallySelected) return
									props.onFileSelect?.(visuallySelected)
									setOpen(false)
								}}
							>
								Select
							</Button>
						</DialogDescription>
					</DialogHeader>

					<FileGridMain
						{...props}
						onFileSelect={file => {
							setOpen(false)
							props.onFileSelect?.(file)
						}}
						visuallySelected={visuallySelected}
						setVisuallySelected={setVisuallySelected}
					/>
				</DialogContent>
			</Dialog>
		)
	}
}

/**
 * Main component rendering the file grid with drag and drop support.
 */
export const FileGridMain = ({
	files,
	origin,
	onFileSelect,
	onFileUpdate,
	onFileDeleted,
	onUpload,
	dialogTrigger,
	visuallySelected,
	setVisuallySelected,
}: FileGridProps & {
	visuallySelected?: FileMetadata | null
	setVisuallySelected?: React.Dispatch<
		React.SetStateAction<FileMetadata | null>
	>
}) => {
	const { data: userSession } = authClient.useSession()

	///////////////////////////////////////////
	///        Drag, Drop and Upload        ///
	///////////////////////////////////////////
	const [acceptedTypes, setAcceptedTypes] = useState({
		images: true,
		videos: true,
		audio: true,
		documents: true,
	})

	const getAcceptedFileTypes = useCallback(() => {
		const types: { [type: string]: [] } = {}
		if (acceptedTypes.images) types['image/*'] = []
		if (acceptedTypes.videos) types['video/*'] = []
		if (acceptedTypes.audio) types['audio/*'] = []
		if (acceptedTypes.documents) {
			types['application/pdf'] = []
			types['text/plain'] = []
		}
		return types
	}, [acceptedTypes])

	// 1. Generate key for file
	// 2. uploadToPresignedUrl via XML and track uploadProgress
	// 3. Save file to fileState once completed
	const { uploadProgress, setUploadProgress, uploadToPresignedUrl } =
		useFileUpload()
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: getAcceptedFileTypes(),
		onDrop: async acceptedFiles => {
			if (!userSession) return

			const newFiles: FileUploading[] = acceptedFiles.map(file => ({
				file,
				key: generateStorageKey(file, userSession.user.id),
			}))

			// Initialize progress state for all files (showing pending status)
			const initialProgress = newFiles.reduce(
				(acc, { file, key }) => ({
					...acc,
					[key]: {
						file: file,
						progress: 0,
						status: 'pending' as const,
					},
				}),
				{} as UploadState,
			)

			// Update the progress state with all pending files
			setUploadProgress(prev => ({ ...prev, ...initialProgress }))

			try {
				// Now fetch presigned URLs (files will show as "pending" during this time), then upload
				const presignedFiles = await fetchPresignedPutUrls(newFiles)
				await uploadToPresignedUrl(presignedFiles)
				onUpload?.(presignedFiles)

				setFileState(prev => {
					return [...prev, ...presignedFiles]
				})
			} catch (error) {
				console.error('Error uploading files', error)
				setUploadProgress(prev => {
					const newProgress = { ...prev }

					let errorMessage = 'Upload failed'
					if (error instanceof ZodError) {
						const errorMessages = error.errors
							.map(err => err.message)
							.join('; ')
						errorMessage = `Validation error: ${errorMessages}.`
					} else if (error instanceof Error) {
						console.log('Error')
						errorMessage = error.message
					}

					for (const file of newFiles) {
						newProgress[file.key] = {
							...newProgress[file.key],
							status: 'error',
							error: errorMessage,
						}
					}
					return newProgress
				})
			}
		},
	})

	/////////////////////////
	///   File handling   ///
	/////////////////////////
	const [fileState, setFileState] = useState<FileGridProps['files']>(files)

	useEffect(() => {
		setFileState(files)
	}, [files])

	const handleFileUpdate = (fileMeta: FileMetadata) => {
		// Handle object storage connection
		setFileState(prev => {
			return prev.map(file => {
				if (file.id === fileMeta.id) {
					return { ...file, ...fileMeta }
				}
				return file
			})
		})
		onFileUpdate?.(fileMeta)
	}

	const handleFileDelete = (file: FileMetadata) => {
		setFileState(prev => {
			return prev.filter(prevFile => prevFile.id !== file.id)
		})
		onFileDeleted?.(file)
	}

	return (
		<div
			className={cn(
				'relative h-auto grow rounded-xl border-4 border-dashed p-3',
				isDragActive ? 'border-4 border-sky-600 dark:border-sky-600' : '',
			)}
			{...getRootProps()}
		>
			<input {...getInputProps()} />
			<div
				className={cn(
					'bg-muted absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-lg',
					isDragActive ? '' : 'hidden',
				)}
			>
				<CloudUploadIcon className="text-primary h-12 w-12" />
			</div>
			{fileState.length > 0 ? (
				<div
					className={cn(
						'grid gap-2',
						fileState.length === 1
							? 'grid-cols-2'
							: 'grid-cols-[repeat(auto-fit,minmax(100px,1fr))]',
						dialogTrigger
							? 'sm:grid-cols-3 md:grid-cols-4'
							: 'sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7',
					)}
				>
					{fileState.map((file, index) => {
						return (
							<FileCard
								key={index}
								file={file}
								origin={origin}
								onSelect={onFileSelect}
								onUpdate={handleFileUpdate}
								onDeleted={handleFileDelete}
								visuallySelected={visuallySelected}
								setVisuallySelected={setVisuallySelected}
							/>
						)
					})}
				</div>
			) : (
				<div className="text-muted-foreground flex h-full min-h-60 w-full grow flex-col items-center justify-center gap-3">
					<CupSoda size={50} />
					<p className="max-w-sm text-center">
						No file found, drag and drop, or click to select files now
					</p>
				</div>
			)}

			<ProgressCard uploadProgress={uploadProgress} />
		</div>
	)
}
