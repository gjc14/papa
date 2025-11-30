import { useAtom } from 'jotai'

import { crossSellProductsAtom } from '../context'
import { ProductCard, ProductCardSkeleton } from './product-card'

function ProductCrossSellWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-8">
			{children}
		</div>
	)
}

export function ProductCrossSell() {
	const [crossSellProducts] = useAtom(crossSellProductsAtom)

	if (!crossSellProducts || crossSellProducts.length === 0) return null

	return (
		<>
			<h2 className="mt-16 mb-8 text-2xl font-light">You may also like</h2>
			<ProductCrossSellWrapper>
				{crossSellProducts.map(csp => (
					<ProductCard key={csp.id} product={csp} />
				))}
			</ProductCrossSellWrapper>
		</>
	)
}

export function ProductCrossSellSkeleton() {
	return (
		<>
			<h2 className="mt-16 mb-8 text-2xl font-light">You may also like</h2>
			<ProductCrossSellWrapper>
				{Array.from({ length: 3 }).map((_, i) => (
					<ProductCardSkeleton key={i} />
				))}
			</ProductCrossSellWrapper>
		</>
	)
}
