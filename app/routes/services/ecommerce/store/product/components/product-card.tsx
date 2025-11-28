import { Link } from 'react-router'

import { useAtomValue } from 'jotai'

import { Skeleton } from '~/components/ui/skeleton'

import type { ProductListing } from '../../../lib/db/product.server'
import { storeConfigAtom } from '../context'
import { formatPrice } from '../utils/price'

type ProductCardProps = {
	product: ProductListing
}

export const ProductCard = ({ product }: ProductCardProps) => {
	const storeConfig = useAtomValue(storeConfigAtom)

	const displayPrice = product.option.salePrice || product.option.price
	const hasDiscount =
		!!product.option.salePrice &&
		product.option.salePrice < product.option.price

	const fmt = new Intl.NumberFormat(storeConfig.language, {
		style: 'currency',
		currency: product.option.currency,
		// RangeError: maximumFractionDigits value is out of range. Must be between 0 and 100.
		minimumFractionDigits: product.option.scale,
		maximumFractionDigits: product.option.scale,
	})

	return (
		<Link
			to={`/store/product/${product.slug}`}
			className="group cursor-pointer"
		>
			<div className="relative mb-4 aspect-square overflow-hidden">
				{product.option.image ? (
					<img
						src={product.option.image}
						alt={product.name}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full flex-1 items-center justify-center">
						?
					</div>
				)}
				{hasDiscount && (
					<div className="bg-primary-foreground border-primary/60 text-primary absolute top-2 right-2 border px-2 py-1 text-xs md:top-4 md:right-4">
						SALE
					</div>
				)}
			</div>
			<h3 className="mb-2 text-sm font-light">{product.name}</h3>
			<div className="flex items-center gap-x-2">
				<span className="text-base">
					{fmt.format(
						formatPrice(
							displayPrice,
							product.option.scale,
						) as Intl.StringNumericLiteral,
					)}
				</span>
				{hasDiscount && (
					<span className="text-muted-foreground text-xs line-through">
						{fmt.format(
							formatPrice(
								product.option.price,
								product.option.scale,
							) as Intl.StringNumericLiteral,
						)}
					</span>
				)}
			</div>
		</Link>
	)
}

export const ProductCardSkeleton = () => {
	return (
		<div>
			<Skeleton className="mb-4 aspect-square rounded-none" />
			<Skeleton className="mb-2 h-4 w-3/4 rounded-none" />
			<Skeleton className="mb-2 h-4 w-3/4 rounded-none" />
		</div>
	)
}
