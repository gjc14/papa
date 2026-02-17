/**
 * Store Product Page is a component that could be dynamically rendered from database.
 */
import { useAtomValue } from 'jotai'

import { Separator } from '~/components/ui/separator'

import { ProductBreadcrumb } from './components/product-breadcrumb'
import { ProductContent } from './components/product-content'
import {
	ProductCrossSell,
	ProductCrossSellSkeleton,
} from './components/product-cross-sell'
import {
	ProductGallery,
	ProductGallerySkeleton,
} from './components/product-gallery'
import { isResolvingAtom, productAtom } from './context'

/**
 * Store product page component, displays product, image gallery, and cross-sell products.
 */
export function StoreProductPage() {
	const product = useAtomValue(productAtom)

	const isResolving = useAtomValue(isResolvingAtom)

	if (!product) return null

	return (
		<div className="relative w-full flex-1 space-y-16 px-3 md:px-8 @xl:px-12">
			<div className="my-3 flex items-center justify-start gap-2">
				<ProductBreadcrumb />
			</div>
			<div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-8 lg:gap-16">
				{isResolving.productGallery ? (
					<ProductGallerySkeleton />
				) : (
					<ProductGallery />
				)}

				<ProductContent />
			</div>

			{/* Cross Sell Section */}
			<div className="my-24">
				<Separator />
				{isResolving.crossSellProducts ? (
					<ProductCrossSellSkeleton />
				) : (
					<ProductCrossSell />
				)}
			</div>

			{/* TODO: Recent Viewed */}
		</div>
	)
}
