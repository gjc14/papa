import { useEffect, useState } from 'react'

import { CloudAlert, Loader } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { cn, defaultValidUrlProtocols, isValidUrl } from '~/lib/utils'
import { FileGrid } from '~/routes/papa/dashboard/assets/components/file-grid'
import type { loader } from '~/routes/papa/dashboard/assets/resource'

type AssetSelectionDialogProps = {
	/** @link [DialogTrigger](./ui/dialog.tsx) */
	trigger?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** When insert available @default true */
	available?: boolean
	/** Source URL of the asset */
	srcInput: string
	/** Set the source URL of the asset */
	setSrcInput: React.Dispatch<React.SetStateAction<string>>
	/** Alt text of the asset */
	altInput: string
	/** Set the alt text of the asset */
	setAltInput: React.Dispatch<React.SetStateAction<string>>
	/** Title of the asset */
	titleInput: string
	/** Set the title of the asset */
	setTitleInput: React.Dispatch<React.SetStateAction<string>>
	/** Label of the action button @default 'Insert' */
	actionLabel?: string
	/** Callback when action button is clicked to insert */
	onAction?: () => void
	/** Title of the asset type, e.g. Image, Video, etc. */
	title?: string
} & Pick<AssetGalleryProps, 'assets' | 'isLoading'> &
	React.ComponentProps<typeof DialogContent>

/**
 * ```tsx
 * () => {
 *  return (
 *      <AssetSelectionDialog
 *         	actionLabel="Insert"
 *         	title="Image"
 *         	trigger={
 *         		<TooltipWrapper tooltip="Image" shortcut={IMAGE_SHORTCUT}>
 *         			<DialogTrigger asChild>
 *         				<Button
 *         					size={'icon'}
 *         					variant={'ghost'}
 *         					className={`h-8 w-8 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
 *         					disabled={!canRun}
 *         				>
 *         					<Image size={14} />
 *         				</Button>
 *         			</DialogTrigger>
 *         		</TooltipWrapper>
 *         	}
 *         	asset={filesContext}
 *         	isLoading={isLoading}
 *         	open={isImageSelectorOpen}
 *         	onOpenChange={open => {
 *         		setIsImageSelectorOpen(open)
 
 *         		if (open) {
 *         			const { src, alt, title } = editor.getAttributes('image')
 *         			setSrcInput(src || '')
 *         			setAltInput(alt || '')
 *         			setTitleInput(title || '')
 *         		} else {
 *         			editor.commands.focus()
 *         		}
 *         	}}
 *         	available={canRun}
 *         	srcInput={srcInput}
 *         	setSrcInput={setSrcInput}
 *         	altInput={altInput}
 *         	setAltInput={setAltInput}
 *         	titleInput={titleInput}
 *         	setTitleInput={setTitleInput}
 *         	onAction={handleInsert}
 *         />
 *      )
 * }
 * ```
 */
export function AssetSelectionDialog({
	trigger,
	open,
	onOpenChange,
	available,
	srcInput,
	setSrcInput,
	altInput,
	setAltInput,
	titleInput,
	setTitleInput,
	actionLabel,
	onAction,
	title,
	assets,
	isLoading,
	...dialogContentProps
}: AssetSelectionDialogProps) {
	const [assetLoading, setAssetLoading] = useState(false)
	const [assetError, setAssetError] = useState(false)
	const [currentLoadingSrc, setCurrentLoadingSrc] = useState('')

	const validSrcInput =
		srcInput.startsWith('/assets') ||
		isValidUrl(srcInput, [...defaultValidUrlProtocols, 'blob:'])

	const isAvailable = (available || true) && validSrcInput

	useEffect(() => {
		if (validSrcInput && srcInput !== currentLoadingSrc) {
			setAssetLoading(true)
			setAssetError(false)
			setCurrentLoadingSrc(srcInput)
		} else if (!validSrcInput) {
			setAssetLoading(false)
			setAssetError(false)
			setCurrentLoadingSrc('')
		}
	}, [srcInput, currentLoadingSrc])

	const handleAssetLoad = () => {
		setAssetLoading(false)
		setAssetError(false)
	}

	const handleAssetError = () => {
		setAssetLoading(false)
		setAssetError(true)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger}
			<DialogContent
				{...dialogContentProps}
				className={cn(
					'max-h-[90vh] overflow-scroll',
					dialogContentProps.className,
				)}
			>
				<DialogTitle hidden>{`Add ${title}`}</DialogTitle>
				<DialogDescription hidden></DialogDescription>
				<div className="flex flex-col items-center gap-3">
					{/* Preview */}
					<section
						className={`supports-[backdrop-filter]:bg-background/10 bg-background flex h-40 w-full items-center justify-center border backdrop-blur-md`}
					>
						{isAvailable ? (
							<>
								{/* TODO: add other type of asset previews */}
								<img
									src={srcInput}
									alt={altInput}
									title={titleInput}
									className={`max-h-40 object-contain transition-opacity ${
										assetLoading ? 'hidden' : 'opacity-100'
									}`}
									onLoad={handleAssetLoad}
									onError={handleAssetError}
								/>
								{assetLoading && <Loader className="animate-spin" />}
								{assetError && <>❌</>}
							</>
						) : (
							<>🍌</>
						)}
					</section>

					{/* Inputs */}
					<section className="flex w-full flex-col gap-2">
						<div className="w-full">
							<Label htmlFor="asset-src">{title} URL*</Label>
							<Input
								id="asset-src"
								value={srcInput}
								onChange={e => setSrcInput(e.target.value)}
								placeholder="https://example.com/asset.webp"
							/>
						</div>

						<div className="w-full">
							<Label htmlFor="asset-alt">{title} Alt Text </Label>
							<Input
								id="asset-alt"
								value={altInput}
								onChange={e => setAltInput(e.target.value)}
								placeholder={`My ${title} Alt Text`}
							/>
						</div>

						<div className="w-full">
							<Label htmlFor="asset-title">{title} Title </Label>
							<Input
								id="asset-title"
								value={titleInput}
								onChange={e => setTitleInput(e.target.value)}
								placeholder={`My ${title} Title`}
							/>
						</div>
					</section>

					<Separator />

					<AssetGallery
						assets={assets}
						isLoading={isLoading}
						onSelect={({ src, alt, title }) => {
							setSrcInput(src)
							setAltInput(alt || '')
							setTitleInput(title)
						}}
					/>

					<DialogClose asChild>
						<Button
							onClick={onAction}
							className="mt-2 w-full"
							disabled={!isAvailable}
						>
							{actionLabel || 'Insert'}
						</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	)
}

interface AssetGalleryProps {
	/** Assets returned from '/dashboard/assets/resource' route  */
	assets: Awaited<ReturnType<typeof loader>> | null
	isLoading: boolean
	onSelect: (args: { src: string; alt: string | null; title: string }) => void
}

function AssetGallery({ assets, isLoading, onSelect }: AssetGalleryProps) {
	if (isLoading || !assets) {
		return (
			<div className="text-muted-foreground flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-5">
				<Loader className="animate-spin" />
				<p className="max-w-sm text-center text-sm">
					Loading your assets, please wait a second.
				</p>
			</div>
		)
	} else if (assets.hasObjectStorage || false) {
		return (
			<FileGrid
				files={assets.files || []}
				origin={assets.origin || ''}
				onFileSelect={file => {
					onSelect({
						src: `/assets/${file.id}`,
						alt: file.description,
						title: file.name,
					})
				}}
				cardSize="lg"
			/>
		)
	} else {
		return (
			<div className="text-muted-foreground flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-5">
				<CloudAlert size={30} />
				<p className="max-w-sm text-center text-sm">
					Please setup your S3 Object Storage to start using assets.
				</p>
			</div>
		)
	}
}
