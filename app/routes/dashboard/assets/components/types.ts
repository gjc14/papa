import type React from "react"
import type { FileMetadata } from "~/lib/db/schema"

export type FileGridProps = {
	files: FileMetadata[]
	onUpload?: (files: FileMetadata[]) => void
	/** @default "sm" */
	cardSize?: "sm" | "md" | "lg"
} & FileDisplayBase

export type FileCardProps = {
	file: FileMetadata
} & FileDisplayBase

export interface FileDisplayBase {
	origin: string
	className?: string
	onSelect?: (file: FileMetadata) => void
	onUpdate?: (file: FileMetadata) => void
	onDelete?: (file: FileMetadata) => void
	/** Controllable state to visually show selected single file */
	visuallySelected?: FileMetadata | null
	setVisuallySelected?: React.Dispatch<
		React.SetStateAction<FileMetadata | null>
	>
	selectOnDoubleClick?: boolean
}
