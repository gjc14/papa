import { useEffect, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CircleQuestionMark, Image, MoreVertical } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
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
import type { loader } from '~/routes/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/dashboard/assets/utils'
import {
	productAtom,
	storeConfigAtom,
} from '~/routes/services/ecommerce/store/product/context'

import { assetsAtom } from '../../../context'

const productSeoAtom = atom(get => get(productAtom)?.seo ?? null)
const productNameAtom = atom(get => get(productAtom)?.name ?? null)
const productSlugAtom = atom(get => get(productAtom)?.slug ?? null)
const productDescriptionAtom = atom(
	get => get(productAtom)?.description ?? null,
)

export function Seo() {
	const fetcher = useFetcher<typeof loader>()

	const setProduct = useSetAtom(productAtom)
	const storeConfig = useAtomValue(storeConfigAtom)
	const seo = useAtomValue(productSeoAtom)
	const name = useAtomValue(productNameAtom)
	const slug = useAtomValue(productSlugAtom)
	const description = useAtomValue(productDescriptionAtom)
	const [assets, setAssets] = useAtom(assetsAtom)

	const [aspectRatio, setAspectRatio] = useState('1200x630')
	const [openSelectGallery, setOpenSelectGallery] = useState(false)
	const [srcInput, setSrcInput] = useState('')
	const [altInput, setAltInput] = useState('')
	const [titleInput, setTitleInput] = useState('')

	useEffect(() => {
		if (fetcher.data) setAssets(fetcher.data)
	}, [fetcher.data])

	const handleChange = (updatedData: Partial<typeof productSeoAtom.read>) => {
		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				seo: { ...prev.seo, ...updatedData },
			}
		})
	}

	const copyName = () => {
		handleChange({ metaTitle: name || '' })
	}

	const copyDesc = () => {
		handleChange({ metaDescription: description || '' })
	}

	if (!seo) return null

	return (
		<Card id="seo">
			<CardHeader>
				<CardTitle>SEO</CardTitle>
				<CardDescription>
					Manage your search engine optimization (SEO) to improve product
					visibility.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<FieldSet className="min-w-0">
					<Field>
						<FieldLabel htmlFor="seo-title">
							SEO Title
							<button
								title="Copy Name"
								onClick={copyName}
								className="text-muted-foreground cursor-pointer text-xs underline underline-offset-4"
							>
								Copy Name
							</button>
						</FieldLabel>
						<Input
							id="seo-title"
							name="seo-title"
							type="text"
							placeholder="Meta tilte should match Title (H1) for SEO."
							value={seo.metaTitle || ''}
							onChange={e => {
								handleChange({ metaTitle: e.target.value })
							}}
						/>
					</Field>

					<Field className="min-w-0">
						<FieldLabel htmlFor="seo-description">
							SEO Description
							<button
								title="Copy from description"
								onClick={copyDesc}
								className="text-muted-foreground cursor-pointer text-xs underline underline-offset-4"
							>
								Copy from description
							</button>
						</FieldLabel>
						<Textarea
							id="seo-description"
							name="seo-description"
							rows={3}
							placeholder="Short description about your post..."
							value={seo.metaDescription || ''}
							onChange={e => {
								handleChange({ metaDescription: e.target.value })
							}}
						/>

						<div className="bg-muted/50 flex w-full min-w-0 flex-col rounded-md border p-3">
							<div className="mb-3 flex w-full flex-wrap items-start justify-between gap-x-2">
								<p className="text-primary text-xs font-bold tracking-wider uppercase">
									Search Preview
								</p>
							</div>

							<div className="flex min-w-0 items-center gap-1">
								<span className="truncate text-[12px]">
									{`${import.meta.env.VITE_BASE_URL} › ${storeConfig.storeFrontPath.slice(1)} › product › ${slug} `}
								</span>
								<MoreVertical
									size={16}
									className="text-muted-foreground flex-shrink-0"
								/>
							</div>
							<h3 className="mt-1 min-w-0 cursor-pointer truncate text-xl font-normal text-[#1a0dab] hover:underline dark:text-[#99c3ff]">
								{seo.metaTitle || name}
							</h3>
							<div className="mt-1 line-clamp-2 text-sm text-[#474747] dark:text-[#bfbfbf]">
								{seo.metaDescription || description}
							</div>
						</div>
					</Field>

					<Field>
						<FieldLabel htmlFor="seo-og-image">SEO Open Graph Image</FieldLabel>
						<Field orientation={'horizontal'}>
							<Input
								id="seo-og-image"
								name="seo-og-image"
								type="text"
								placeholder="https://example.com/image.webp"
								value={seo.ogImage || ''}
								onChange={e => {
									handleChange({ ogImage: e.target.value })
								}}
							/>

							<AssetSelectionDialog
								actionLabel="Insert"
								title="Image"
								trigger={
									<Tooltip>
										<TooltipTrigger asChild>
											<DialogTrigger asChild>
												<Button
													variant={'outline'}
													size={'icon'}
													onClick={() =>
														!assets && fetcher.load(assetResourceRoute)
													}
												>
													<Image />
												</Button>
											</DialogTrigger>
										</TooltipTrigger>
										<TooltipContent>Select from assets</TooltipContent>
									</Tooltip>
								}
								assets={assets}
								isLoading={fetcher.state === 'loading'}
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
								onAction={() => handleChange({ ogImage: srcInput })}
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

						<div className="bg-muted/50 flex w-full flex-col rounded-md border p-3">
							<div className="mb-3 flex w-full flex-wrap items-start justify-between gap-x-2 gap-y-1">
								<p className="text-primary text-xs font-bold tracking-wider uppercase">
									OG Image Preview
								</p>

								<div className="flex items-center gap-1">
									<Select value={aspectRatio} onValueChange={setAspectRatio}>
										<SelectTrigger className="h-8 w-fit gap-2">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1200x630">1200x630</SelectItem>
											<SelectItem value="1200x675">1200x675</SelectItem>
										</SelectContent>
									</Select>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="link" className="size-6 text-sm">
												<CircleQuestionMark />
											</Button>
										</TooltipTrigger>
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
								className="relative flex max-w-md shrink items-center justify-center overflow-hidden rounded-md border"
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
							onChange={e => {
								handleChange({ keywords: e.target.value })
							}}
						/>
						<FieldDescription>
							Separate keywords with commas (,).
						</FieldDescription>
					</Field>
				</FieldSet>
			</CardContent>
		</Card>
	)
}
