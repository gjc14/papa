import type { Route } from './+types/route'
import { useEffect } from 'react'
import { Link } from 'react-router'

import { useSetAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ArrowLeft, Store } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from '~/components/error-boundary-template'
import { validateAdminSession } from '~/routes/auth/utils'

import {
	getCrossSellProducts,
	getProduct,
	getProductGallery,
} from '../../lib/db/product.server'
import {
	crossSellProductsAtom,
	isResolvingAtom,
	productAtom,
	productGalleryAtom,
} from './context'
import { StoreProductPage } from './page'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const url = new URL(request.url)
	const preview = url.searchParams.get('preview') === 'true'
	if (preview) await validateAdminSession(request)

	const product = await getProduct({
		slug: params.productSlug,
		preview: preview,
	})

	if (!product) {
		// TODO: fetch customized "not found" text
		throw new Response('Product Not Found', {
			status: 404,
		})
	}

	const productGalleryPromise = new Promise<
		Awaited<ReturnType<typeof getProductGallery>>
	>(async resolve => {
		const gallery = await getProductGallery(product.id)
		// Insert main product image as first image if exists
		if (product.option.image) {
			gallery.unshift({
				image: product.option.image,
				productId: product.id,
				order: 0,
				alt: product.name,
				title: product.name,
			})
		}
		resolve(gallery)
	})

	const crossSellProductsPromise = getCrossSellProducts(product.id)

	return { product, productGalleryPromise, crossSellProductsPromise }
}

export default function ProductRoute({ loaderData }: Route.ComponentProps) {
	useHydrateAtoms([[productAtom, loaderData.product]])
	const setProduct = useSetAtom(productAtom)
	const setIsResolving = useSetAtom(isResolvingAtom)
	const setCrossSellProducts = useSetAtom(crossSellProductsAtom)
	const setProductGallery = useSetAtom(productGalleryAtom)

	useEffect(() => {
		setProduct(loaderData.product)
		setIsResolving({
			crossSellProducts: true,
			productGallery: true,
		})

		// Resolve promises
		loaderData.crossSellProductsPromise
			.then(setCrossSellProducts)
			.finally(() => setIsResolving(r => ({ ...r, crossSellProducts: false })))
		loaderData.productGalleryPromise
			.then(setProductGallery)
			.finally(() => setIsResolving(r => ({ ...r, productGallery: false })))

		return () => {
			setProduct(null)
			setIsResolving({ crossSellProducts: false, productGallery: false })
			setCrossSellProducts([])
			setProductGallery([])
		}
	}, [loaderData])

	return <StoreProductPage />
}

export function ErrorBoundary() {
	return (
		<ErrorBoundaryTemplate>
			{props => <ProductErrorTemplate {...props} returnTo={'/store'} />}
		</ErrorBoundaryTemplate>
	)
}

const ProductErrorTemplate = ({
	status,
	statusMessage,
	errorMessage,
	returnTo,
}: ErrorBoundaryTemplateProps & {
	returnTo: string
}) => {
	// TODO: use store context to display store name, etc.
	// const store = useStoreContext()
	return (
		<main className="flex w-screen flex-1 flex-col items-center justify-between">
			<div></div>
			<div className="flex flex-col items-center justify-center text-center">
				<h1 className="inline-block text-[30vw] font-medium md:text-[20vw]">
					{status}
				</h1>
				<Separator className="mt-3 mb-6 w-20 md:w-36" />

				<h2 className="text-base font-light">
					{statusMessage.text || 'Product Error Page'}
				</h2>

				<div className="mt-12 mb-8 flex items-center gap-3">
					<Button variant={'link'} asChild>
						<Link to={returnTo}>
							<ArrowLeft size={12} />
							Return to <code>{returnTo}</code>
						</Link>
					</Button>
					<Button variant={'outline'} asChild>
						<Link to={'/store'}>
							Browse Products
							<Store size={12} />
						</Link>
					</Button>
				</div>

				<div>
					<p className="text-muted-foreground text-sm">Need assistance?</p>
					<Button variant={'link'} asChild>
						<Link to={'/store/contact'}>Contact Us</Link>
					</Button>
				</div>
			</div>
			<div className="font-open-sans mb-8 flex items-center">
				<p className="mr-3 inline-block border-r pr-5 text-lg font-normal">
					{/* TODO: Store name */}
					{'Papa E-Commerce'}
				</p>
				<div className="inline-block">
					<p className="text-left text-xs font-light">
						{/* TODO: Store Copyright */}© {new Date().getFullYear()}{' '}
						{'CHIU YIN CHEN @Taipei'}
					</p>
				</div>
			</div>
		</main>
	)
}
