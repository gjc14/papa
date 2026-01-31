import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Image, Plus, X } from 'lucide-react'

import { Card, CardContent } from '~/components/ui/card'
import { DialogTrigger } from '~/components/ui/dialog'
import { Skeleton } from '~/components/ui/skeleton'
import { AssetSelectionDialog } from '~/components/asset-selection-dialog'
import { assetsAtom } from '~/context/assets'
import type { loader } from '~/routes/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/dashboard/assets/utils'

import {
	productAtom,
	productGalleryAtom,
} from '../../../../store/product/context'

const productImageAtom = atom(get => get(productAtom)?.option.image ?? null)
const productImageAltAtom = atom(
	get => get(productAtom)?.option.imageAlt ?? null,
)
const productImageTitleAtom = atom(
	get => get(productAtom)?.option.imageTitle ?? null,
)
const productIdAtom = atom(get => get(productAtom)?.id ?? null)
const productNameAtom = atom(get => get(productAtom)?.name ?? null)

export function Gallery() {
	const fetcher = useFetcher<typeof loader>()

	const setProduct = useSetAtom(productAtom)
	const [gallery, setGallery] = useAtom(productGalleryAtom)
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)
	const productImage = useAtomValue(productImageAtom)
	const productImageAlt = useAtomValue(productImageAltAtom)
	const productImageTitle = useAtomValue(productImageTitleAtom)
	const [assets, setAssets] = useAtom(assetsAtom)

	const [openSelectFeature, setOpenSelectFeature] = useState(false)
	const [openSelectGallery, setOpenSelectGallery] = useState(false)
	const [srcInput, setSrcInput] = useState('')
	const [altInput, setAltInput] = useState('')
	const [titleInput, setTitleInput] = useState('')

	useEffect(() => {
		if (fetcher.data) setAssets(fetcher.data)
	}, [fetcher.data])

	if (!productId || productName === null) return null

	const handleSetFeatureImage = () => {
		if (!srcInput) return

		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				option: {
					...prev.option,
					image: srcInput,
					imageAlt: altInput,
					imageTitle: titleInput,
				},
			}
		})
	}

	const handleRemoveFeatureImage = () => {
		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				option: {
					...prev.option,
					image: null,
					imageAlt: null,
					imageTitle: null,
				},
			}
		})
	}

	const handleInsertGallery = () => {
		if (!gallery || !srcInput) return

		const newImage = {
			image: srcInput,
			alt: altInput,
			title: titleInput,
			productId: productId,
			order: gallery.length + 1,
		}

		setGallery(prev => [...(prev ? prev : []), newImage])
	}

	const galleryPending = gallery === null

	return (
		<Card id="gallery">
			<CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div className="flex flex-col gap-2 md:col-span-1">
					<h3 className="mb-1 text-sm font-medium">Feature Image</h3>

					<AssetSelectionDialog
						actionLabel="Set as Feature Image"
						title="Image"
						trigger={
							<DialogTrigger
								onClick={() => !assets && fetcher.load(assetResourceRoute)}
								render={
									productImage ? (
										<div className="relative">
											<button
												type="button"
												onClick={e => {
													e.stopPropagation()
													handleRemoveFeatureImage()
												}}
												className="bg-destructive absolute top-1 right-1 cursor-pointer rounded-full p-0.5 text-white hover:opacity-80"
											>
												<X size={12} />
											</button>
											<img
												src={productImage}
												alt={productName}
												className="aspect-square h-full w-full cursor-pointer object-cover"
											/>
										</div>
									) : (
										<div className="bg-accent border-muted-foreground flex aspect-square cursor-pointer items-center justify-center border border-dashed">
											<Image />
										</div>
									)
								}
							/>
						}
						assets={assets}
						isLoading={fetcher.state === 'loading'}
						open={openSelectFeature}
						onOpenChange={open => {
							setOpenSelectFeature(open)
							if (open) {
								setSrcInput(productImage || '')
								setAltInput(productImageAlt || '')
								setTitleInput(productImageTitle || '')
							} else {
								setSrcInput('')
								setAltInput('')
								setTitleInput('')
							}
						}}
						srcInput={srcInput}
						setSrcInput={setSrcInput}
						altInput={altInput}
						setAltInput={setAltInput}
						titleInput={titleInput}
						setTitleInput={setTitleInput}
						onAction={handleSetFeatureImage}
					/>
				</div>

				<div className="flex flex-col gap-2 md:col-span-2">
					<h3 className="mb-1 text-sm font-medium">Gallery</h3>

					<div className="grid grid-cols-3 gap-2">
						{!galleryPending ? (
							gallery
								.sort((a, b) => a.order - b.order)
								.map((item, i) => (
									<div key={i} className="relative">
										<img
											src={item.image}
											alt={item.alt || productName}
											title={item.title || productName}
											className="aspect-square object-cover"
										/>
										<button
											type="button"
											onClick={() => {
												const newGallery = gallery.filter(
													(_, index) => index !== i,
												)
												setGallery(newGallery)
											}}
											className="bg-destructive absolute top-1 right-1 cursor-pointer rounded-full p-0.5 text-white hover:opacity-80"
										>
											<X size={12} />
										</button>
									</div>
								))
						) : (
							<Skeleton className="bg-accent border-muted-foreground flex aspect-square items-center justify-center border border-dashed" />
						)}
						<AssetSelectionDialog
							actionLabel="Insert"
							title="Image"
							trigger={
								<DialogTrigger
									className="bg-accent border-muted-foreground flex aspect-square cursor-pointer items-center justify-center border border-dashed"
									onClick={() => !assets && fetcher.load(assetResourceRoute)}
									hidden={galleryPending}
								>
									<Plus />
								</DialogTrigger>
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
							onAction={handleInsertGallery}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
