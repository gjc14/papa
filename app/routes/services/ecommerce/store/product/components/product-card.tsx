import { Link } from 'react-router'

import { useAtomValue } from 'jotai'

import { Skeleton } from '~/components/ui/skeleton'

import type { ProductListing } from '../../../lib/db/product.server'
import { storeConfigAtom } from '../context'
import { renderPrice } from '../utils/price'

type ProductCardProps = {
	product: ProductListing
}

export const ProductCard = ({ product }: ProductCardProps) => {
	const storeConfig = useAtomValue(storeConfigAtom)
	const { formattedPrice, formattedOriginalPrice, hasDiscount } = renderPrice(
		product.option,
	)

	return (
		<Link
			to={`/store/product/${product.slug}`}
			className="group cursor-pointer"
		>
			<div className="relative mb-4 aspect-square overflow-hidden">
				<img
					src={product.option.image || storeConfig.placeholderImage.image}
					alt={
						product.name ||
						storeConfig.placeholderImage.imageAlt ||
						storeConfig.name
					}
					title={
						product.name ||
						storeConfig.placeholderImage.imageTitle ||
						storeConfig.name
					}
					className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				{hasDiscount && (
					<div className="bg-primary-foreground border-primary/60 text-primary absolute top-2 right-2 border px-2 py-1 text-xs md:top-4 md:right-4">
						SALE
					</div>
				)}
			</div>
			<h3 className="mb-2 text-sm font-light">{product.name}</h3>
			<div className="flex items-center gap-x-2">
				<span className="text-base">{formattedPrice}</span>
				{hasDiscount && (
					<span className="text-muted-foreground text-xs line-through">
						{formattedOriginalPrice}
					</span>
				)}
			</div>
		</Link>
	)
}

export const ProductCardSkeleton = () => {
	return (
		<div>
			<Skeleton className="mb-4 aspect-square" />
			<Skeleton className="mb-2 h-4 w-3/4" />
			<Skeleton className="mb-2 h-4 w-3/4" />
		</div>
	)
}
