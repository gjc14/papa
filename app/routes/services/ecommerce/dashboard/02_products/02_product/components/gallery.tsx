import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Image, X } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { DialogTrigger } from '~/components/ui/dialog'
import { AssetSelectionDialog } from '~/components/asset-selection-dialog'
import { SeparatorWithText } from '~/components/separator-with-text'
import type { loader } from '~/routes/papa/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/papa/dashboard/assets/utils'

import {
	productAtom,
	productGalleryAtom,
} from '../../../../store/product/context'
import { assetsAtom } from '../../../context'

const productImageAtom = atom(get => get(productAtom)?.option.image || null)
const productImageAltAtom = atom(
	get => get(productAtom)?.option.imageAlt || null,
)
const productImageTitleAtom = atom(
	get => get(productAtom)?.option.imageTitle || null,
)
const productIdAtom = atom(get => get(productAtom)?.id || null)
const productNameAtom = atom(get => get(productAtom)?.name || null)

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

	if (!productId || !productName || !productImage) return null

	if (!gallery) return null // TODO: skeleton

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

	const handleInsertGallery = () => {
		if (!srcInput) return

		const newImage = {
			image: srcInput,
			alt: altInput,
			title: titleInput,
			productId: productId,
			order: gallery.length + 1,
		}

		setGallery(prev => [...(prev ? prev : []), newImage])
	}

	return (
		<Card className="gap-3 p-3">
			{productImage ? (
				<img
					src={productImage}
					alt={productName}
					className="aspect-square rounded-md object-cover"
					onClick={() => {}}
				/>
			) : (
				<div
					onClick={() => {}}
					className="flex aspect-square items-center justify-center rounded-md border"
				>
					🍌
				</div>
			)}
			<AssetSelectionDialog
				actionLabel="Set as Feature Image"
				title="Image"
				trigger={
					<DialogTrigger asChild>
						<Button
							variant={'outline'}
							size={'sm'}
							className={`w-full`}
							onClick={() => !assets && fetcher.load(assetResourceRoute)}
						>
							<Image />
							Edit Feature Image
						</Button>
					</DialogTrigger>
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
			<SeparatorWithText text="Gallery" />
			<div className="grid grid-cols-3 gap-2">
				{gallery.map((item, i) => (
					<div key={i} className="relative">
						<img
							key={i}
							src={item.image}
							alt={item.alt || productName}
							title={item.title || productName}
							className="aspect-square rounded object-cover"
						/>
						<button
							type="button"
							onClick={() => {
								const newGallery = gallery.filter((_, index) => index !== i)
								setGallery(newGallery)
							}}
							className="bg-destructive absolute top-0.5 right-0.5 cursor-pointer rounded-full p-0.5 text-white hover:opacity-80"
						>
							<X size={12} />
						</button>
					</div>
				))}
			</div>
			<AssetSelectionDialog
				actionLabel="Insert"
				title="Image"
				trigger={
					<DialogTrigger asChild>
						<Button
							variant={'outline'}
							size={'sm'}
							className={`w-full`}
							onClick={() => !assets && fetcher.load(assetResourceRoute)}
						>
							<Image />
							Add Image
						</Button>
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
		</Card>
	)
}
