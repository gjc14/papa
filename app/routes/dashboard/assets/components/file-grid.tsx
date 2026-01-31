import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { toast } from 'sonner'
import { CloudUploadIcon, CupSoda } from 'lucide-react'

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

import { useFileUpload } from '../utils'
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
	/** Controllable state to visually show selected single file */
	visuallySelected?: FileMetadata | null
	setVisuallySelected?: React.Dispatch<
		React.SetStateAction<FileMetadata | null>
	>
	/** @default "sm" */
	cardSize?: 'sm' | 'md' | 'lg'
}

/**
 * @param dialogTrigger - Add trigger button as children to use FileGrid as Dialog
 * @param onFileSelect - Callback when file is selected
 */
export const FileGrid = (props: FileGridProps) => {
	if (!props.dialogTrigger) {
		return <FileGridMain {...props} />
	}

	const [open, setOpen] = useState(false)
	const [internalVisuallySelected, setInternalVisuallySelected] =
		useState<FileMetadata | null>(null)

	const visuallySelected = props.visuallySelected ?? internalVisuallySelected
	const setVisuallySelected =
		props.setVisuallySelected ?? setInternalVisuallySelected

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
					cardSize={props.cardSize || (props.dialogTrigger ? 'md' : undefined)}
				/>
			</DialogContent>
		</Dialog>
	)
}

/**
 * Main component rendering the file grid with drag and drop support.
 */
const FileGridMain = ({
	files,
	origin,
	onFileSelect,
	onFileUpdate,
	onFileDeleted,
	onUpload,
	dialogTrigger,
	visuallySelected,
	setVisuallySelected,
	cardSize = 'sm',
}: FileGridProps) => {
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

	const { uploadProgress, oneStepUpload } = useFileUpload()
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: getAcceptedFileTypes(),
		onDrop: async acceptedFiles => {
			if (!userSession) return

			try {
				const filesWithPresignedUrl = await oneStepUpload(
					acceptedFiles,
					userSession.user.id,
				)
				onUpload?.(filesWithPresignedUrl)
			} catch (error) {
				console.error('Error uploading files:', error)
				return toast.error('Error uploading files. Please try again.')
			}
		},
	})

	return (
		<div
			className={cn(
				'relative h-auto w-full grow overflow-scroll rounded-xl border-4 border-dashed p-3',
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
			{files.length > 0 ? (
				<div
					className={cn(
						'grid gap-2',
						files.length === 1
							? 'grid-cols-2'
							: 'grid-cols-[repeat(auto-fit,minmax(100px,1fr))]',
						cardSize === 'lg'
							? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
							: cardSize === 'md'
								? 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
								: 'sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7', // sm
					)}
				>
					{files.map(file => {
						return (
							<FileCard
								key={file.key}
								file={file}
								origin={origin}
								onSelect={onFileSelect}
								onUpdate={onFileUpdate}
								onDeleted={onFileDeleted}
								visuallySelected={visuallySelected}
								setVisuallySelected={setVisuallySelected}
								selectOnDoubleClick={dialogTrigger ? true : false}
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
