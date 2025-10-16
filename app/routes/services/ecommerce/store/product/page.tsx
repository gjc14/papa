/**
 * Store Product Page is a component that could be dynamically rendered from database.
 */
import { useAtom } from 'jotai'

import { Separator } from '~/components/ui/separator'

import { ProductBreadcrumb } from './components/product-breadcrumb'
import { ProductCard, ProductCardSkeleton } from './components/product-card'
import { ProductContent } from './components/product-content'
import {
	ProductImageGallery,
	ProductImageGallerySkeleton,
} from './components/product-image-gallery'
import { crossSellProductsAtom, isResolvingAtom, productAtom } from './context'

/**
 * Store product page component, displays product, image gallery, and cross-sell products.
 */
export function StoreProductPage() {
	const [product] = useAtom(productAtom)
	const [crossSellProducts] = useAtom(crossSellProductsAtom)

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
				<h2 className="mt-16 mb-8 text-2xl font-light">You may also like</h2>
				<div className="grid grid-cols-2 gap-8 @lg:grid-cols-3">
					{isResolving.crossSellProducts
						? Array.from({ length: 3 }).map((_, i) => (
								<ProductCardSkeleton key={i} />
							))
						: crossSellProducts?.map(csp => (
								<ProductCard key={csp.id} product={csp} />
							))}
				</div>
			</div>
		</div>
	)
}
