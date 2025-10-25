import type { Route } from './+types/route'
import { useEffect } from 'react'
import { type ShouldRevalidateFunctionArgs } from 'react-router'

import { useSetAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'

import {
	getCrossSellProducts,
	getProduct,
	getProductGallery,
	getUpsellProducts,
} from '../../../lib/db/product.server'
import {
	crossSellProductsAtom,
	isResolvingAtom,
	productAtom,
	productGalleryAtom,
	upsellProductsAtom,
} from '../../../store/product/context'
import { ProductEditPage } from './page'

export const loader = async ({ params }: Route.LoaderArgs) => {
	const product = await getProduct({
		slug: params.productSlug,
		edit: true,
	})

	if (!product) {
		throw new Response('Product Not Found', { status: 404 })
	}

	const productGalleryPromise = getProductGallery(product.id)
	const crossSellProductsPromise = getCrossSellProducts(product.id)
	const upsellProductsPromise = getUpsellProducts(product.id)

	return {
		product,
		productGalleryPromise,
		crossSellProductsPromise,
		upsellProductsPromise,
	}
}

// To prevent revalidation when fetchers are called (taxonomies, brands, etc.)
// Please call revalidate() manually when updating product
export const shouldRevalidate = ({
	currentParams,
	nextParams,
}: ShouldRevalidateFunctionArgs) => {
	return currentParams !== nextParams
}

export default function ECProduct({ loaderData }: Route.ComponentProps) {
	useHydrateAtoms([[productAtom, loaderData.product]])
	const setProduct = useSetAtom(productAtom)
	const setIsResolving = useSetAtom(isResolvingAtom)
	const setProductGallery = useSetAtom(productGalleryAtom)
	const setCrossSellProducts = useSetAtom(crossSellProductsAtom)
	const setUpsellProducts = useSetAtom(upsellProductsAtom)

	useEffect(() => {
		setProduct(loaderData.product)
		setIsResolving({
			crossSellProducts: true,
			productGallery: true,
		})

		// Resolve promises
		loaderData.productGalleryPromise
			.then(setProductGallery)
			.finally(() => setIsResolving(r => ({ ...r, productGallery: false })))
		loaderData.crossSellProductsPromise
			.then(setCrossSellProducts)
			.finally(() => setIsResolving(r => ({ ...r, crossSellProducts: false })))
		loaderData.upsellProductsPromise
			.then(setUpsellProducts)
			.finally(() => setIsResolving(r => ({ ...r, upsellProducts: false })))

		return () => {
			setProduct(null)
			setIsResolving({ crossSellProducts: false, productGallery: false })
			setCrossSellProducts([])
			setProductGallery([])
		}
	}, [loaderData])

	return <ProductEditPage />
}
