import { forwardRef, useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import {
	AudioWaveform,
	Expand,
	ExternalLink,
	File,
	Film,
	Loader2,
	Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { FileMetadata } from '~/lib/db/schema'
import { cn } from '~/lib/utils'

import { assetResourceRoute } from '../utils'

export type FileCardProps = {
	file: FileMetadata
	origin: string
	className?: string
	onSelect?: (file: FileMetadata) => void
	onUpdate?: (file: FileMetadata) => void
	onDeleted?: (file: FileMetadata) => void
	visuallySelected?: FileMetadata | null
	setVisuallySelected?: React.Dispatch<
		React.SetStateAction<FileMetadata | null>
	>
	selectOnDoubleClick?: boolean
}

/**
 * onClick on a file card will set setVisuallySelected and make a dashed border around the card
 * onSelect will be called when the card is clicked (or double clicked if selectOnDoubleClick is true)
 */
export const FileCard = ({
	file,
	origin,
	className,
	onSelect,
	onUpdate,
	onDeleted,
	visuallySelected,
	setVisuallySelected,
	selectOnDoubleClick = false,
}: FileCardProps) => {
	const fetcher = useFetcher()
	const { mutating } = useFetcherNotification(fetcher)
	const [open, setOpen] = useState(false)
	const [deleteAlert, setDeleteAlert] = useState(false)

	const [fileName, setFileName] = useState(file.name)
	const [description, setDescription] = useState(file.description ?? '')

	useEffect(() => {
		setFileName(file.name || '')
		setDescription(file.description || '')
	}, [file.name, file.description])

	const fileGeneralType = file.type.split('/')[0]
	const url = `/assets/${file.id}`

	const handleUpdate = () => {
		if (mutating) return

		const fileMetadataUpdated = {
			...file,
			name: fileName,
			description: description,
		}

		onUpdate?.(fileMetadataUpdated)
		fetcher.submit(JSON.stringify(fileMetadataUpdated), {
			action: assetResourceRoute,
			method: 'PUT',
			encType: 'application/json',
		})
	}

	const handleDelete = () => {
		if (mutating) return
		fetcher.submit(JSON.stringify({ key: file.key }), {
			action: assetResourceRoute,
			method: 'DELETE',
			encType: 'application/json',
		})
		onDeleted?.(file)
		setDeleteAlert(false)
		setOpen(false)

		if (setVisuallySelected) {
			setTimeout(() => {
				setVisuallySelected(prev => {
					if (prev?.id === file.id) {
						return null
					}
					return prev
				})
			}, 0)
		}
	}

	return (
		<div
			className={cn(
				'group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border',
				className,
				onSelect ? 'cursor-pointer' : 'cursor-default',
				visuallySelected?.id === file.id
					? 'border-primary border-2 border-dashed'
					: '',
			)}
			onClick={e => {
				e.stopPropagation()
				!selectOnDoubleClick && onSelect?.(file)
				setVisuallySelected?.(file)
			}}
			onDoubleClick={e => {
				e.stopPropagation()
				selectOnDoubleClick && onSelect?.(file)
			}}
		>
			{fileGeneralType === 'image' ? (
				<img src={url} alt={file.name} />
			) : fileGeneralType === 'video' ? (
				<Film />
			) : fileGeneralType === 'audio' ? (
				<AudioWaveform />
			) : (
				<File />
			)}
			{deleteAlert && (
				<div className="bg-background supports-[backdrop-filter]:bg-background/20 absolute flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg pt-3 backdrop-blur-xs">
					<Button
						variant={'destructive'}
						size={'sm'}
						className="h-6 px-2 py-1.5 text-[10px]"
						onClick={handleDelete}
					>
						Delete
					</Button>
					<button
						className="h-6 cursor-pointer px-2 py-1.5 text-[10px] underline-offset-2 hover:underline"
						onClick={() => setDeleteAlert(false)}
					>
						Cancel
					</button>
				</div>
			)}
			{/* options */}
			<div
				className={cn(
					`hidden ${deleteAlert ? '' : 'group-hover:flex'}`,
					'bg-background absolute bottom-3 left-[50%] translate-x-[-50%]',
					'items-center justify-center gap-1 rounded-lg border px-1 py-0.5',
				)}
			>
				<ToolBarButton
					onClick={() => setDeleteAlert(true)}
					className="hover:bg-destructive hover:text-white"
				>
					<Trash2 />
				</ToolBarButton>

				<ToolBarButton onClick={() => setOpen(true)}>
					<Expand />
				</ToolBarButton>
			</div>
			{/* Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="max-h-[90vh] overflow-scroll"
					onDoubleClick={e => e.stopPropagation()}
				>
					<DialogHeader className="space-y-3">
						<DialogTitle className="flex grid-cols-3 items-center gap-1.5">
							{file.name}
						</DialogTitle>
						<DialogDescription className="flex min-h-36 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border">
							{fileGeneralType === 'image' ? (
								<img className="max-h-[50vh]" src={url} alt={file.name} />
							) : fileGeneralType === 'video' ? (
								<video src={url} controls className="w-full">
									Your browser does not support the
									<code>video</code> element.
								</video>
							) : fileGeneralType === 'audio' ? (
								<audio src={url} controls className="w-full">
									Your browser does not support the
									<code>audio</code> element.
								</audio>
							) : (
								<>
									<File />
									{file.type}
								</>
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col items-center gap-1.5 overflow-scroll px-1">
						<div className="w-full gap-2">
							<Label htmlFor="id" className="px-1">
								ID
							</Label>
							<p
								id="id"
								className="min-h-0 flex-1 cursor-copy overflow-y-auto rounded-lg border px-1.5 py-1 text-sm shadow-xs"
								onClick={() => {
									navigator.clipboard.writeText(String(file.id))
									toast.success('Copied to clipboard')
								}}
							>
								{file.id}
							</p>
						</div>
						<div className="w-full gap-2">
							<Label htmlFor="url" className="px-1">
								URL
							</Label>
							<div className="flex items-center gap-2">
								<p
									id="url"
									className="min-h-0 flex-1 cursor-copy overflow-y-auto rounded-lg border px-1.5 py-1 text-sm shadow-xs"
									onClick={() => {
										navigator.clipboard.writeText(origin + url)
										toast.success('Copied to clipboard')
									}}
								>
									{origin + url}
								</p>
								<a href={url} target="_blank" rel="noopener noreferrer">
									<Button variant={'ghost'} size={'icon'}>
										<ExternalLink className="h-5 w-5" />
									</Button>
								</a>
							</div>
						</div>

						<div className="w-full gap-2">
							<Label htmlFor="name" className="px-1">
								File Name
							</Label>
							<Input
								id="name"
								placeholder="File name"
								value={fileName}
								onChange={e => setFileName(e.target.value)}
							/>
						</div>
						<div className="w-full gap-2">
							<Label htmlFor="description" className="px-1">
								Description
							</Label>
							<Textarea
								id="description"
								placeholder="Description"
								value={description}
								onChange={e => setDescription(e.target.value)}
							/>
						</div>

						<div id="file-details" className="my-2 w-full px-1">
							<p className="text-sm">
								<strong>File Type:</strong> {file.type}
							</p>
							<p className="text-sm">
								<strong>File Size:</strong>{' '}
								{file.size > 1024 * 1024 * 1024
									? `${Math.round(
											(file.size || file.size) / 1024 / 1024 / 1024,
										)} GB`
									: (file.size || file.size) > 1024 * 1024
										? `${Math.round((file.size || file.size) / 1024 / 1024)} MB`
										: `${Math.round((file.size || file.size) / 1024)} KB`}
							</p>
							<p className="text-sm">
								<strong>Last Modified:</strong>{' '}
								{new Date(file.updatedAt).toLocaleString()}
							</p>
						</div>

						<Button
							className="w-full"
							disabled={mutating && fetcher.formMethod === 'PUT'}
							onClick={handleUpdate}
						>
							{mutating && fetcher.formMethod === 'PUT' ? (
								<Loader2 className="animate-spin" />
							) : (
								'Save'
							)}
						</Button>
						<Separator className="my-3" />

						<AlertDialog>
							<AlertDialogTrigger
								render={
									<Button variant={'link'} className="h-fit w-fit p-0">
										Delete permanently
									</Button>
								}
							/>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Continue delete this file permanently?
									</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete{' '}
										{file.name} from servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleDelete}>
										Delete permanently
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

const ToolBarButton = ({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	return (
		<Button
			{...props}
			className={cn(
				'hover:bg-accent text-primary inline-flex size-6 cursor-pointer items-center justify-center gap-2 rounded-full bg-transparent p-1 whitespace-nowrap transition-colors',
				className,
			)}
		/>
	)
}
