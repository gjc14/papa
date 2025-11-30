import { useState } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'

import { productGallery as productGalleryTable } from '../../../lib/db/schema'
import { useProductContext } from '../hooks/use-product-context'

const ProductImageGalleryWrapper = ({
	sticky = true,
	children,
}: {
	sticky?: boolean
	children?: React.ReactNode
}) => {
	return (
		<div className={`${sticky ? 'md:sticky md:top-16' : ''} h-min`}>
			{children}
		</div>
	)
}

export type ProductGallery = (typeof productGalleryTable.$inferSelect)[]

export const ProductImageGallery = () => {
	const { storeConfig, product, productGallery, hoveredAttributeImage } =
		useProductContext()

	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	if (!product) return null

	const gallery = [
		...(product.option.image
			? [
					{
						image: product.option.image,
						alt: product.option.imageAlt || product.name,
						title: product.option.imageTitle || product.name,
					},
				]
			: []),
		...(productGallery || []),
	]

	const nextImage = () => {
		setCurrentImageIndex(prev => (prev + 1) % gallery.length)
	}

	const prevImage = () => {
		setCurrentImageIndex(prev => (prev - 1 + gallery.length) % gallery.length)
	}

	return (
		<ProductImageGalleryWrapper sticky={true}>
			<div className="relative">
				<img
					src={
						hoveredAttributeImage
							? hoveredAttributeImage.image
							: gallery.length
								? gallery[currentImageIndex].image
								: storeConfig.placeholderImage.image
					}
					alt={
						hoveredAttributeImage?.imageAlt
							? hoveredAttributeImage.imageAlt
							: storeConfig.placeholderImage.imageAlt || product.name
					}
					title={
						hoveredAttributeImage?.imageTitle
							? hoveredAttributeImage.imageTitle
							: storeConfig.placeholderImage.imageTitle || product.name
					}
					className="aspect-square w-full object-cover transition-all"
				/>
				{gallery.length > 1 && (
					<>
						<Button
							onClick={prevImage}
							className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/60 text-black transition-colors hover:bg-white"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<Button
							onClick={nextImage}
							className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/60 text-black transition-colors hover:bg-white"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</>
				)}
			</div>
			<div className="mt-4 flex gap-2">
				{gallery.map((img, idx) => (
					<button
						key={idx}
						onClick={() => setCurrentImageIndex(idx)}
						className={`h-20 w-20 cursor-pointer border-2 transition-colors ${
							idx === currentImageIndex
								? 'border-primary'
								: 'border-transparent'
						}`}
					>
						<img
							src={img.image}
							alt={img.alt || product.name}
							title={img.title || product.name}
							className="h-full w-full object-cover"
						/>
					</button>
				))}
			</div>
		</ProductImageGalleryWrapper>
	)
}

export const ProductImageGallerySkeleton = ({
	sticky = true,
}: {
	sticky?: boolean
}) => {
	return (
		<ProductImageGalleryWrapper sticky={sticky}>
			{/* Main image skeleton */}
			<Skeleton className="aspect-square w-full rounded-none" />

			{/* Thumbnail gallery skeleton */}
			<div className="mt-4 flex gap-2">
				{[...Array(3)].map((_, idx) => (
					<Skeleton key={idx} className="h-20 w-20 rounded-none" />
				))}
			</div>
		</ProductImageGalleryWrapper>
	)
}
