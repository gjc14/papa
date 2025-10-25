import { useCallback, useEffect } from 'react'
import { Link, useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { ExternalLink, Trash } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Spinner } from '~/components/ui/spinner'
import { Switch } from '~/components/ui/switch'
import type {
	ConnectCrossSellProducts,
	ConnectUpsellProducts,
} from '~/routes/services/ecommerce/lib/db/product.server'

import {
	crossSellProductsAtom,
	productAtom,
	productGalleryAtom,
	storeConfigAtom,
	upsellProductsAtom,
} from '../../../../store/product/context'
import {
	isMovingToTrashAtom,
	isResetAlertOpenAtom,
	isSavingAtom,
	isToTrashAlertOpenAtom,
	livePreviewAtom,
} from '../context'
import type { action } from '../resource'

const productIdAtom = atom(get => get(productAtom)?.id || null)
const productNameAtom = atom(get => get(productAtom)?.name || null)
const productSlugAtom = atom(get => get(productAtom)?.slug || null)

export function ProductEditPageHeader() {
	const fetcher = useFetcher<typeof action>()

	const store = useStore()
	const [preview, setPreview] = useAtom(livePreviewAtom)
	const [isSaving, setIsSaving] = useAtom(isSavingAtom)
	const storeConfig = useAtomValue(storeConfigAtom)
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)
	const productSlug = useAtomValue(productSlugAtom)
	const isMovingToTrash = useAtomValue(isMovingToTrashAtom)
	const setResetOpen = useSetAtom(isResetAlertOpenAtom)
	const setToTrashOpen = useSetAtom(isToTrashAlertOpenAtom)

	useEffect(() => setIsSaving(fetcher.state === 'submitting'), [fetcher.state])

	if (!productId || !productName || !productSlug) return null

	const isNew = productId === -1

	const handleSave = useCallback(() => {
		const product = store.get(productAtom)
		const productGallery = store.get(productGalleryAtom)
		const crossSellProducts = store.get(crossSellProductsAtom)
		const upsellProducts = store.get(upsellProductsAtom)

		if (!product || !productGallery || !crossSellProducts || !upsellProducts)
			return

		if (isSaving || isMovingToTrash) return

		const payload = JSON.stringify(
			{
				...product,
				gallery: productGallery,
				crossSellProductIds: crossSellProducts.map((p, i) => ({
					crossSellProductId: p.id,
					order: i,
				})) satisfies ConnectCrossSellProducts,
				upsellProductIds: upsellProducts.map((p, i) => ({
					upsellProductId: p.id,
					order: i,
				})) satisfies ConnectUpsellProducts,
			},
			(_, v) => (typeof v === 'bigint' ? v.toString() : v),
		)
		fetcher.submit(payload, {
			method: isNew ? 'POST' : 'PUT',
			action: 'resource', // :productSlug/resource route is where the action defined
			encType: 'application/json',
		})
	}, [store])

	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 overflow-auto border-b backdrop-blur">
			<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
				<div className="flex items-center gap-2">
					<p className="text-muted-foreground">{!isNew ? 'Edit' : 'Create'}</p>
					<h1 className="text-xl font-semibold">{productName}</h1>
					{!isNew && (
						<span className="text-muted-foreground text-sm">
							ID: {productId}
						</span>
					)}
				</div>
				<div className="flex items-center gap-3">
					<Label htmlFor="preview" className="text-sm">
						Preview
					</Label>
					<Switch id="preview" checked={preview} onCheckedChange={setPreview} />
					<Button variant={'ghost'} size={'icon'} asChild className="size-8">
						<Link
							to={`${storeConfig.storeFrontPath}/product/${productSlug}`}
							target="_blank"
							rel="noreferrer"
						>
							<ExternalLink />
						</Link>
					</Button>
					<Separator orientation="vertical" className="h-6" />
					{!isNew && (
						<Button
							size="icon"
							variant="ghost"
							type="button"
							className="hover:bg-destructive dark:hover:bg-destructive size-8"
							onClick={() => setToTrashOpen(true)}
							disabled={isSaving || isMovingToTrash}
						>
							{isMovingToTrash ? <Spinner /> : <Trash />}
						</Button>
					)}
					<Button
						size="sm"
						variant="outline"
						type="button"
						onClick={() => setResetOpen(true)}
						disabled={isSaving || isMovingToTrash}
					>
						Reset
					</Button>
					<Button
						size="sm"
						type="submit"
						form="product-edit-form"
						onClick={handleSave}
						disabled={isSaving || isMovingToTrash}
					>
						{isSaving && <Spinner />}
						{isNew ? 'Create Product' : 'Save Product'}
					</Button>
				</div>
			</div>
		</header>
	)
}
