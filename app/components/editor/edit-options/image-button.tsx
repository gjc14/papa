import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'

import { PopoverClose } from '@radix-ui/react-popover'
import { Editor } from '@tiptap/react'
import { CloudAlert, Image, Loader } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { SeparatorWithText } from '~/components/separator-with-text'
import type { FileMetadata } from '~/lib/db/schema'
import { FileGrid } from '~/routes/papa/dashboard/assets/components/file-grid'
import type { loader } from '~/routes/papa/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/papa/dashboard/assets/utils'

import { ToggleButton } from '../components/toggle-button'

export const ImageButton = ({ editor }: { editor: Editor }) => {
	const fetcher = useFetcher<typeof loader>()

	const urlInputRef = useRef<HTMLInputElement>(null)
	const altInputRef = useRef<HTMLInputElement>(null)
	const titleInputRef = useRef<HTMLInputElement>(null)
	const fileLoadedRef = useRef(false)

	const [open, setOpen] = useState(false)
	const [files, setFiles] = useState<FileMetadata[]>([])
	const [origin, setOrigin] = useState<string>('')
	const [hasObjectStorage, setHasObjectStorage] = useState(false)

	const isLoading = fetcher.state !== 'idle'

	const insertImage = ({
		url,
		alt,
		title,
	}: {
		url: string
		alt?: string
		title?: string
	}) => {
		if (!editor) return
		if (!url) return

		editor
			.chain()
			.focus()
			.setImage({
				src: url,
				alt: alt || 'Image',
				title: title || 'Image',
			})
			.run()
	}

	useEffect(() => {
		if (fetcher.data) {
			setFiles(fetcher.data.files)
			setOrigin(fetcher.data.origin)
			setHasObjectStorage(fetcher.data.hasObjectStorage)
			fileLoadedRef.current = true
		}
	}, [fetcher])

	return (
		<Popover
			open={open}
			onOpenChange={open => {
				!fileLoadedRef.current && fetcher.load(assetResourceRoute)
				setOpen(open)
			}}
		>
			<PopoverTrigger asChild>
				<ToggleButton disabled={false} tooltip="Insert Image">
					<Image size={14} />
				</ToggleButton>
			</PopoverTrigger>

			<PopoverContent className="w-96">
				<div className="grid gap-3">
					<div className="space-y-2">
						<h4>Insert Image</h4>
						<p className="text-muted-foreground text-sm">
							Select an image from gallery or paste a URL to insert an image
						</p>
					</div>

					{!fileLoadedRef.current || isLoading ? (
						<Button disabled>
							<Loader className="animate-spin" /> Select from Gallery
						</Button>
					) : hasObjectStorage ? (
						<FileGrid
							files={files}
							origin={origin}
							dialogTrigger={<Button>Select from Gallery</Button>}
							onFileSelect={file => {
								insertImage({
									url: `/assets/${file.id}`,
									alt: file.name || 'image',
									title: file.name || '',
								})
								setOpen(false)
							}}
						/>
					) : (
						<div className="flex h-full min-h-60 w-full grow flex-col items-center justify-center gap-3 rounded-xl border">
							<CloudAlert size={50} />
							<p className="max-w-sm text-center">
								Please setup your S3 Object Storage to start uploading assets
							</p>
						</div>
					)}

					<SeparatorWithText text="or" />

					<div className="grid gap-2">
						<div className="grid grid-cols-3 items-center gap-1">
							<Label htmlFor="url">URL</Label>
							<Input
								ref={urlInputRef}
								id="url"
								placeholder="https://yinc.me/logo.png"
								className="col-span-2 h-8"
							/>
						</div>
						<div className="grid grid-cols-3 items-center gap-1">
							<Label htmlFor="alt">Alt</Label>
							<Input
								ref={altInputRef}
								id="alt"
								placeholder="alt"
								className="col-span-2 h-8"
							/>
						</div>
						<div className="grid grid-cols-3 items-center gap-1">
							<Label htmlFor="title">Title</Label>
							<Input
								ref={titleInputRef}
								id="title"
								placeholder="title"
								className="col-span-2 h-8"
							/>
						</div>
					</div>

					<footer>
						<PopoverClose asChild>
							<Button
								className="w-full"
								variant={'outline'}
								onClick={() => {
									const url = urlInputRef.current?.value
									const alt = altInputRef.current?.value
									const title = titleInputRef.current?.value

									if (url) {
										insertImage({
											url,
											alt,
											title,
										})
									}
								}}
							>
								Insert Image
							</Button>
						</PopoverClose>
					</footer>
				</div>
			</PopoverContent>
		</Popover>
	)
}
