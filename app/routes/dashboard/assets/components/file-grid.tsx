/**
 * This file contains 2 components:
 * 1. {@link FileGrid} - Render files and take file upload
 * 2. {@link FileGridDialog} - Dialog version of FileGrid
 */
import { CloudUploadIcon, CupSoda } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog"
import { authClient } from "~/lib/auth/auth-client"
import type { FileMetadata } from "~/lib/db/schema"
import { cn } from "~/lib/utils"

import { useFileUpload } from "../utils"
import { FileCard } from "./file-card"
import { ProgressCard } from "./progress-card"
import type { FileGridProps } from "./types"

/**
 * 1. Rendering file grid from files.
 * 2. File(s) upload.
 * 3. Upload progress ui display.
 */
export const FileGrid = (props: FileGridProps) => {
	const { files, onUpload, cardSize = "sm" } = props

	const { data: userSession } = authClient.useSession()

	///////////////////////////////////////////
	///        Drag, Drop and Upload        ///
	///////////////////////////////////////////
	const [acceptedTypes] = useState({
		images: true,
		videos: true,
		audio: true,
		documents: true,
	})

	const getAcceptedFileTypes = useCallback(() => {
		const types: { [type: string]: [] } = {}
		if (acceptedTypes.images) types["image/*"] = []
		if (acceptedTypes.videos) types["video/*"] = []
		if (acceptedTypes.audio) types["audio/*"] = []
		if (acceptedTypes.documents) {
			types["application/pdf"] = []
			types["text/plain"] = []
		}
		return types
	}, [acceptedTypes])

	const { uploadProgress, oneStepUpload } = useFileUpload()
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: getAcceptedFileTypes(),
		onDrop: async (acceptedFiles) => {
			if (!userSession) return

			try {
				const filesWithPresignedUrl = await oneStepUpload(
					acceptedFiles,
					userSession.user.id,
				)
				onUpload?.(filesWithPresignedUrl)
			} catch (error) {
				console.error("Error uploading files:", error)
				return toast.error("Error uploading files. Please try again.")
			}
		},
	})

	return (
		<div
			className={cn(
				"relative h-auto w-full grow overflow-scroll border-4 border-dashed p-3",
				isDragActive ? "border-4 border-sky-600 dark:border-sky-600" : "",
			)}
			{...getRootProps()}
		>
			<input {...getInputProps()} />
			<div
				className={cn(
					"bg-muted absolute inset-0 z-10 flex h-full w-full items-center justify-center",
					isDragActive ? "" : "hidden",
				)}
			>
				<CloudUploadIcon className="text-foreground h-12 w-12" />
			</div>
			{files.length > 0 ? (
				<div
					className={cn(
						"grid gap-2",
						files.length === 1
							? "grid-cols-2"
							: "grid-cols-[repeat(auto-fit,minmax(100px,1fr))]",
						cardSize === "lg"
							? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
							: cardSize === "md"
								? "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
								: "sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7", // sm
					)}
				>
					{files.map((file) => {
						return <FileCard key={file.key} file={file} {...props} />
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

/**
 * There's an additional button in header to trigger select when dialog mode.
 * @default
 * {
 * 	selectOnDoubleClick: true // single click: visually selected
 * 	cardSize: "md"
 * }
 */
export const FileGridDialog = (
	props: FileGridProps & {
		trigger: React.ReactElement
		title?: string
	},
) => {
	const [open, setOpen] = useState(false)
	const [internalVSelected, setInternalVSelected] =
		useState<FileMetadata | null>(null)

	const visuallySelected = props.visuallySelected ?? internalVSelected
	const setVisuallySelected = props.setVisuallySelected ?? setInternalVSelected

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={props.trigger} />
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
								props.onSelect?.(visuallySelected)
								setOpen(false)
							}}
						>
							{props.title ? props.title : "Select"}
						</Button>
					</DialogDescription>
				</DialogHeader>

				<FileGrid
					{...props}
					onSelect={(file) => {
						setOpen(false)
						props.onSelect?.(file)
					}}
					visuallySelected={visuallySelected}
					setVisuallySelected={setVisuallySelected}
					selectOnDoubleClick={props.selectOnDoubleClick || true}
					cardSize={props.cardSize || "md"}
				/>
			</DialogContent>
		</Dialog>
	)
}
