import { useCallback, useEffect, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import {
	ExternalLink,
	Eye,
	MoreVertical,
	RefreshCcw,
	Trash,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from '~/components/ui/item'
import { Label } from '~/components/ui/label'
import { Spinner } from '~/components/ui/spinner'
import { Switch } from '~/components/ui/switch'
import { useFetcherNotification } from '~/hooks/use-notification'
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
	const { isSubmitting } = useFetcherNotification(fetcher)

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
	const setProduct = useSetAtom(productAtom)

	const [slugInput, setSlugInput] = useState(productSlug || '')
	const [editSlug, setEditSlug] = useState(false)

	useEffect(() => setIsSaving(isSubmitting), [fetcher.state])

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
		<Item className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b-border sticky top-0 z-10 rounded-none py-2 backdrop-blur">
			<ItemContent>
				<ItemTitle>
					<span className="text-muted-foreground">
						({!isNew ? 'Edit' : 'Create'}){' '}
					</span>
					{productName}
					{!isNew && (
						<span className="text-muted-foreground">ID: {productId}</span>
					)}
				</ItemTitle>
				<ItemDescription className="overflow-visible">
					Path:{' '}
					{editSlug ? (
						<>
							{storeConfig.storeFrontPath}/product/
							<Input
								value={slugInput}
								onChange={e => setSlugInput(e.target.value)}
								className="text-primary ml-2 h-8 w-fit"
								autoFocus
							/>
							<Button
								className="text-primary-foreground ml-2 h-8"
								size="sm"
								onClick={() => {
									setProduct(pv => (pv ? { ...pv, slug: slugInput } : pv))
									setEditSlug(false)
								}}
							>
								Save
							</Button>
							<Button
								className="text-primary ml-2 h-8"
								variant="outline"
								size="sm"
								onClick={() => {
									setSlugInput(productSlug)
									setEditSlug(false)
								}}
							>
								Cancel
							</Button>
						</>
					) : (
						<>
							<Link
								to={`${storeConfig.storeFrontPath}/product/${productSlug}?preview=true`}
								target="_blank"
								rel="noreferrer"
							>
								{storeConfig.storeFrontPath}/product/{productSlug}
								<ExternalLink className="ml-1 inline-block size-3.5" />
							</Link>
							<Button
								className="ml-2 h-fit px-0"
								variant="link"
								size="sm"
								onClick={() => setEditSlug(true)}
							>
								Edit
							</Button>
						</>
					)}
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button
					size="sm"
					type="submit"
					onClick={handleSave}
					disabled={isSaving || isMovingToTrash}
					className="flex-1"
				>
					{isSaving && <Spinner />}
					{isNew ? 'Create Product' : 'Save Product'}
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={'outline'} size={'icon'} className="h-8">
							<MoreVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Product Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => setResetOpen(true)}
							disabled={isSaving || isMovingToTrash}
						>
							<RefreshCcw className="size-4" />
							<span>Reset Product</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={() => setPreview(prev => !prev)}
						>
							<Eye className="size-4" />
							<Label className="mr-auto text-sm">Live Preview</Label>
							<Switch id="preview" className="ml-12" checked={preview} />
						</DropdownMenuItem>

						{!isNew && (
							<DropdownMenuItem
								className="hover:bg-destructive dark:hover:bg-destructive focus-visible:bg-destructive flex items-center gap-2 hover:text-white focus-visible:text-white"
								onClick={() => setToTrashOpen(true)}
								disabled={isSaving || isMovingToTrash}
							>
								{isMovingToTrash ? (
									<Spinner className="size-4" />
								) : (
									<Trash className="size-4" />
								)}
								<span>Move to Trash</span>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	)
}
