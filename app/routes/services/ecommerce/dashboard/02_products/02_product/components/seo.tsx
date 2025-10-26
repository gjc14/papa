import { useEffect, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Image } from 'lucide-react'

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
import type { loader } from '~/routes/papa/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/papa/dashboard/assets/utils'
import { productAtom } from '~/routes/services/ecommerce/store/product/context'

import { assetsAtom } from '../../../context'

const productSeoAtom = atom(get => get(productAtom)?.seo || null)
const productNameAtom = atom(get => get(productAtom)?.name || null)
const productDescriptionAtom = atom(
	get => get(productAtom)?.description || null,
)

export function Seo() {
	const fetcher = useFetcher<typeof loader>()

	const setProduct = useSetAtom(productAtom)
	const seo = useAtomValue(productSeoAtom)
	const name = useAtomValue(productNameAtom)
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
		<Card>
			<CardHeader>
				<CardTitle>SEO</CardTitle>
				<CardDescription>Manage your product's SEO settings</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldSet>
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

					<Field>
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
						<div className="flex items-start justify-between gap-2">
							<div
								className="flex flex-1 items-center justify-center overflow-hidden rounded-md border"
								style={{
									aspectRatio: aspectRatio.replace('x', '/'),
								}}
							>
								{seo?.ogImage ? (
									<img
										src={seo.ogImage}
										alt={seo?.metaTitle || 'SEO Open Graph Image'}
										className="object-cover"
									/>
								) : (
									'⛰️'
								)}
							</div>
							<Select value={aspectRatio} onValueChange={setAspectRatio}>
								<SelectTrigger className="w-28">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1200x630">1200x630</SelectItem>
									<SelectItem value="1200x675">1200x675</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<FieldDescription>
							Recommended no smaller than 600x315, and 5MB file size.{' '}
							{aspectRatio === '1200x630'
								? 'Standard size, used by Facebook, LinkedIn, Threads, and other platforms.'
								: aspectRatio === '1200x675'
									? 'Used by Twitter.'
									: ''}
						</FieldDescription>
					</Field>
				</FieldSet>
			</CardContent>
		</Card>
	)
}
