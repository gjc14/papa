import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFetcher } from 'react-router'

import {
	Check,
	ChevronsUpDown,
	CloudUploadIcon,
	CupSoda,
	X,
} from 'lucide-react'

import AnimatedCircularProgressBar from '~/components/ui/animated-circular-progress-bar'
import { Button } from '~/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '~/components/ui/collapsible'
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

export interface FileGridProps {
	files: FileMetadata[]
	origin: string
	onFileSelect?: (file: FileMetadata) => void
	onFileUpdate?: (fileMeta: FileMetadata) => void
	onFileDeleted?: (file: FileMetadata) => void
	dialogTrigger?: React.ReactNode
	uploadMode?: 'single' | 'multiple'
	onUpload?: (files: File[]) => void
}

/**
 * FileGrid Component should be wrap in display: flex as it uses flex: 1 to grow
 * @param dialogTrigger Add ReactNode to use FileGrid as Dialog
 */
export const FileGrid = (props: FileGridProps) => {
	if (!props.dialogTrigger) {
		return <FileGridMain {...props} />
	} else if (props.dialogTrigger) {
		return (
			<Dialog>
				<DialogTrigger asChild>{props.dialogTrigger}</DialogTrigger>
				<DialogContent className="max-h-[80vh] max-w-xl overflow-scroll">
					<DialogHeader>
						<DialogTitle>Assets</DialogTitle>
						<DialogDescription>
							Lists all your asstes here, You could drag or click to upload your
							file
						</DialogDescription>
					</DialogHeader>

					<FileGridMain {...props} />
				</DialogContent>
			</Dialog>
		)
	}
}

// TODO: Fix: the old, deleted file will show when new file is uploaded
const FileGridMain = ({
	files,
	origin,
	onFileSelect,
	onFileUpdate,
	onFileDeleted,
	uploadMode,
	onUpload,
	dialogTrigger,
}: FileGridProps) => {
	const fetcher = useFetcher()
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
	// 3. Save file to fileUploaded once completed
	const { uploadProgress, setUploadProgress, uploadToPresignedUrl } =
		useFileUpload()
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: getAcceptedFileTypes(),
		onDrop: async acceptedFiles => {
			if (!userSession) return

			try {
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

				// Now fetch presigned URLs (files will show as "pending" during this time), then upload
				const presignedFiles = await fetchPresignedPutUrls(newFiles)
				await uploadToPresignedUrl(presignedFiles)

				setFileState(prev => {
					return [...prev, ...presignedFiles]
				})
			} catch (error) {
				console.error('Error uploading files', error)
			}
		},
	})

	/////////////////////////
	///   File handling   ///
	/////////////////////////
	const [fileState, setFileState] = useState<FileGridProps['files']>(files)

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

	// When file progress display was clicked to hide
	const [hiddenProgressCards, setHiddenProgressCards] = useState<Set<string>>(
		new Set(),
	)
	const visibleUploadProgress = Object.entries(uploadProgress).filter(
		([key]) => !hiddenProgressCards.has(key),
	)

	return (
		<div
			className={cn(
				'relative h-auto grow p-3 border-4 border-dashed rounded-xl',
				isDragActive ? 'border-4 border-sky-600 dark:border-sky-600' : '',
			)}
			{...getRootProps()}
		>
			<input {...getInputProps()} />
			<div
				className={cn(
					'z-10 absolute h-full w-full inset-0 flex justify-center items-center bg-muted rounded-lg',
					isDragActive ? '' : 'hidden',
				)}
			>
				<CloudUploadIcon className="w-12 h-12 text-primary" />
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
							/>
						)
					})}
				</div>
			) : (
				<div className="w-full h-full min-h-60 grow flex flex-col items-center justify-center gap-3 text-muted-foreground">
					<CupSoda size={50} />
					<p className="text-center text-pretty max-w-sm">
						No file found, drag and drop, or click to select files now
					</p>
				</div>
			)}

			{visibleUploadProgress.length > 0 && (
				<Collapsible
					className="absolute right-3 bottom-3 w-[350px] space-y-2"
					defaultOpen
					onClick={e => e.stopPropagation()}
				>
					{/* Upload progress card */}
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="w-full flex items-center justify-between space-x-4 py-0 px-4 border bg-muted"
							onClick={e => e.stopPropagation()}
						>
							<h4 className="text-sm font-semibold">
								{visibleUploadProgress.length}{' '}
								{visibleUploadProgress.length > 1 ? 'files' : 'file'} created
							</h4>
							<ChevronsUpDown className="h-4 w-4" />
							<span className="sr-only">Toggle</span>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="space-y-2">
						{visibleUploadProgress.map(([key, upload]) => {
							const { file, progress, status, error } = upload

							return (
								<div
									key={key}
									className="flex items-center px-5 py-3.5 border rounded-md bg-muted"
								>
									<div className="grow max-w-[calc(100%-2rem)] gap-0.5">
										{/* File name */}
										<div
											className="flex items-center justify-start px-0.5 gap-0"
											title={`${file}`}
										>
											<span className="text-sm font-medium truncate mr-1">
												{file.name.split('.')[0]}
											</span>
											<span className="text-sm font-medium shrink-0">
												.{file.name.split('.')[1]}
											</span>
										</div>

										{/* Error message */}
										{error && (
											<p className="text-sm font-medium text-red-500 dark:text-red-600">
												{error}
											</p>
										)}
									</div>

									<div className="ml-3 mr-1 flex shrink-0 items-center">
										{status === 'completed' ? (
											<Button
												variant="outline"
												size="icon"
												className="w-5 h-5 rounded-full bg-lime-500 dark:bg-lime-600 hover:bg-transparent dark:hover:bg-transparent hover:border border-0 border-primary transition-colors duration-200 group"
												onClick={e => {
													e.stopPropagation()
													setHiddenProgressCards(prev => {
														const newSet = new Set(prev)
														newSet.add(key)
														return newSet
													})
												}}
											>
												<Check className="h-4 w-4 group-hover:hidden" />
												<X className="h-4 w-4 hidden group-hover:block" />
												<span className="sr-only">
													{status === 'completed'
														? 'Mark as incomplete'
														: 'Mark as complete'}
												</span>
											</Button>
										) : status === 'error' ? (
											<Button
												variant="outline"
												size="icon"
												className="w-5 h-5 rounded-full bg-red-500 dark:bg-red-600 hover:bg-transparent dark:hover:bg-transparent hover:border border-0 border-primary transition-colors duration-200 group"
												onClick={e => {
													e.stopPropagation()
													setHiddenProgressCards(prev => {
														const newSet = new Set(prev)
														newSet.add(key)
														return newSet
													})
												}}
											>
												<X className="h-4 w-4" />
												<span className="sr-only">{status}</span>
											</Button>
										) : (
											<div className="w-5 h-5 rounded-full border-2 border-muted relative">
												<AnimatedCircularProgressBar
													className="w-full h-full flex items-center justify-center text-xs animate-pulse"
													max={105}
													min={0}
													value={progress}
													showPercent={false}
													strokeWidth={15}
													gaugePrimaryColor="rgb(79 70 229)"
													gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
												/>
											</div>
										)}
									</div>
								</div>
							)
						})}
					</CollapsibleContent>
				</Collapsible>
			)}
		</div>
	)
}
