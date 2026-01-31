/**
 * Reusable SEO edit form if you use the data from seo table
 */
import { useState } from 'react'
import { Link } from 'react-router'

import { CircleQuestionMark, Image, MoreVertical } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { DialogTrigger } from '~/components/ui/dialog'
import {
	Field,
	FieldDescription,
	FieldLabel,
	FieldSet,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import { AssetSelectionDialog } from '~/components/asset-selection-dialog'
import { useAssets } from '~/hooks/use-assets'
import type { Seo } from '~/lib/db/schema'

/**
 * @example
 * ```tsx
 * export function MyComponent() {
 *		const handleChange = (field: string, value: string) => {
 *			setProduct(prev => {
 *				if (!prev) return prev
 *				return {
 *					...prev,
 *					seo: { ...prev.seo, [field]: value },
 *				}
 *			})
 *		}
 *
 *		return (
 *			<SeoFieldSet
 *				seo={seo}
 *				linkPreview={`${import.meta.env.VITE_BASE_URL} › ${storeConfig.storeFrontPath.slice(1)} › product › ${slug}`}
 *				onFillInTitle={() => handleChange('metaTitle', name || '')}
 *				onTitleChange={title => handleChange('metaTitle', title)}
 *				onFillInDescription={() =>
 *					handleChange('metaDescription', description || '')
 *				}
 *				onDescriptionChange={desc => handleChange('metaDescription', desc)}
 *				onFillInOgImage={() => handleChange('ogImage', featureImage || '')}
 *				onOgImageChange={({ src }) => handleChange('ogImage', src)}
 *				onKeywordsChange={keywords => handleChange('keywords', keywords)}
 *			/>
 *		)
 * }
 * ```
 */
export function SeoFieldSet({
	seo,
	linkPreview = import.meta.env.VITE_BASE_URL +
		(seo.route ? `${seo.route.replace(/\//g, ' › ')}` : ''),
	onFillInTitle,
	onTitleChange,
	onFillInDescription,
	onDescriptionChange,
	onFillInOgImage,
	onOgImageChange,
	onKeywordsChange,
}: {
	seo: Seo
	linkPreview?: string
	onFillInTitle: () => void
	onTitleChange: (title: string) => void
	onFillInDescription: () => void
	onDescriptionChange: (description: string) => void
	onFillInOgImage: () => void
	onOgImageChange: (props: { src: string; alt: string; title: string }) => void
	onKeywordsChange: (keywords: string) => void
}) {
	const { assets, setAssets, load, isLoading } = useAssets()

	const [aspectRatio, setAspectRatio] = useState('1200x630')
	const [openSelectGallery, setOpenSelectGallery] = useState(false)
	const [srcInput, setSrcInput] = useState('')
	const [altInput, setAltInput] = useState('')
	const [titleInput, setTitleInput] = useState('')

	return (
		<FieldSet className="min-w-0">
			<Field>
				<FieldLabel htmlFor="seo-title">
					SEO Title
					<FillInButton title="Fill in title" onClick={onFillInTitle} />
				</FieldLabel>
				<Input
					id="seo-title"
					name="seo-title"
					type="text"
					placeholder="Meta title should match Title (H1) for SEO."
					value={seo.metaTitle || ''}
					onChange={e => onTitleChange(e.target.value)}
				/>
			</Field>

			<Field className="min-w-0">
				<FieldLabel htmlFor="seo-description">
					SEO Description
					<FillInButton
						title="Fill in description"
						onClick={onFillInDescription}
					/>
				</FieldLabel>
				<Textarea
					id="seo-description"
					name="seo-description"
					rows={3}
					placeholder="Short description about your post..."
					value={seo.metaDescription || ''}
					onChange={e => onDescriptionChange(e.target.value)}
				/>

				<div className="bg-muted/50 flex w-full min-w-0 flex-col border p-3">
					<div className="mb-3 flex w-full flex-wrap items-start justify-between gap-x-2">
						<p className="text-foreground text-xs font-bold tracking-wider uppercase">
							Search Preview
						</p>
					</div>

					<div className="flex min-w-0 items-center gap-1">
						<span className="truncate text-[12px]">{linkPreview}</span>
						<MoreVertical
							size={12}
							className="text-muted-foreground flex-shrink-0"
						/>
					</div>
					<h3 className="mt-1 min-w-0 cursor-pointer truncate text-xl font-normal text-[#1a0dab] hover:underline dark:text-[#99c3ff]">
						{seo.metaTitle}
					</h3>
					<div className="mt-1 line-clamp-2 text-sm text-[#474747] dark:text-[#bfbfbf]">
						{seo.metaDescription}
					</div>
				</div>
			</Field>

			<Field>
				<FieldLabel htmlFor="seo-og-image">
					SEO Open Graph Image
					<FillInButton
						title="Fill in Open Graph Image"
						onClick={onFillInOgImage}
					/>
				</FieldLabel>
				<Field orientation={'horizontal'}>
					<Input
						id="seo-og-image"
						name="seo-og-image"
						type="text"
						placeholder="https://example.com/image.webp"
						value={seo.ogImage || ''}
						onChange={e =>
							onOgImageChange({
								src: e.target.value,
								alt: altInput,
								title: titleInput,
							})
						}
					/>

					<AssetSelectionDialog
						actionLabel="Insert"
						title="Image"
						trigger={
							<Tooltip>
								<TooltipTrigger
									render={
										<DialogTrigger
											render={
												<Button
													variant={'outline'}
													size={'icon'}
													onClick={() => !assets && load()}
												>
													<Image />
												</Button>
											}
										/>
									}
								/>
								<TooltipContent>Select from assets</TooltipContent>
							</Tooltip>
						}
						assets={assets}
						isLoading={isLoading}
						open={openSelectGallery}
						onOpenChange={open => {
							setOpenSelectGallery(open)
							setSrcInput('')
							setAltInput('')
							setTitleInput('')
						}}
						srcInput={srcInput}
						setSrcInput={setSrcInput}
						altInput={altInput}
						setAltInput={setAltInput}
						titleInput={titleInput}
						setTitleInput={setTitleInput}
						onAction={() =>
							onOgImageChange({
								src: srcInput,
								alt: altInput,
								title: titleInput,
							})
						}
						onUpload={files =>
							setAssets(prev => {
								if (!prev) return prev
								return {
									...prev,
									files: [...prev.files, ...files],
								}
							})
						}
					/>
				</Field>
				<FieldDescription>
					Image that appears when product is shared on social media.{' '}
					<Link
						to="https://www.ogimage.gallery/libary/the-ultimate-guide-to-og-image-dimensions-2024-update"
						target="_blank"
						rel="noopener noreferrer"
						className="underline"
					>
						Learn more about OG image sizes
					</Link>
					.
				</FieldDescription>

				<div className="bg-muted/50 flex w-full flex-col border p-3">
					<div className="mb-3 flex w-full flex-wrap items-start justify-between gap-x-2 gap-y-1">
						<p className="text-foreground text-xs font-bold tracking-wider uppercase">
							OG Image Preview
						</p>

						<div className="flex items-center gap-1">
							<Select
								value={aspectRatio}
								onValueChange={v => v && setAspectRatio(v)}
							>
								<SelectTrigger className="h-8 w-fit gap-2">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1200x630">1200x630</SelectItem>
									<SelectItem value="1200x675">1200x675</SelectItem>
								</SelectContent>
							</Select>
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="link"
											className="text-foreground size-6 text-sm"
										>
											<CircleQuestionMark />
										</Button>
									}
								/>
								<TooltipContent className="text-sm">
									File no smaller than 600x315 / 5MB.
									<br />
									1200x630 is used by Facebook, LinkedIn, Threads, and other
									platforms; 1200x675 is used by X (Twitter).
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					<div
						className="relative flex max-w-md shrink items-center justify-center overflow-hidden border"
						style={{
							aspectRatio: aspectRatio.replace('x', '/'),
						}}
					>
						<img
							src={seo.ogImage || '/placeholders/image.webp'}
							alt={seo?.metaTitle || 'OG Image Preview'}
							className="object-cover"
						/>
					</div>
				</div>
			</Field>

			<Field>
				<FieldLabel htmlFor="seo-keywords">SEO Keywords</FieldLabel>
				<Input
					id="seo-keywords"
					name="seo-keywords"
					type="text"
					placeholder="keyword1, keyword2, keyword3"
					value={seo.keywords || ''}
					onChange={e => onKeywordsChange(e.target.value)}
				/>
				<FieldDescription>Separate keywords with commas (,).</FieldDescription>
			</Field>
		</FieldSet>
	)
}

const FillInButton = ({
	title,
	onClick,
}: {
	title: string
	onClick: () => void
}) => {
	return (
		<button
			type="button"
			className="text-muted-foreground cursor-pointer text-xs underline underline-offset-4"
			onClick={onClick}
			title={title}
		>
			{title}
		</button>
	)
}
