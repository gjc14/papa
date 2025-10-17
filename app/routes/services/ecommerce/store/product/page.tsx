/**
 * Store Product Page is a component that could be dynamically rendered from database.
 */
import { useAtom } from 'jotai'

import { Separator } from '~/components/ui/separator'

import { ProductBreadcrumb } from './components/product-breadcrumb'
import { ProductContent } from './components/product-content'
import {
	ProductCrossSell,
	ProductCrossSellSkeleton,
} from './components/product-cross-sell'
import {
	ProductImageGallery,
	ProductImageGallerySkeleton,
} from './components/product-image-gallery'
import { isResolvingAtom, productAtom } from './context'

/**
 * Store product page component, displays product, image gallery, and cross-sell products.
 */
export function StoreProductPage() {
	const [product] = useAtom(productAtom)

	const [isResolving] = useAtom(isResolvingAtom)

	if (!product) return null

	return (
		<div className="relative w-full flex-1 space-y-16 px-3 @md:px-8 @xl:px-12">
			<div className="my-3 flex items-center justify-start gap-2">
				<ProductBreadcrumb />
			</div>
			<div className="grid grid-cols-1 gap-16 @md:grid-cols-2 @md:gap-8 @lg:gap-16">
				{isResolving.productGallery ? (
					<ProductImageGallerySkeleton />
				) : (
					<ProductImageGallery />
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
		</div>
	)
}
