import { useCallback, useEffect, useState } from 'react'
import { Link, useFetcher, useNavigate } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import {
	Check,
	ExternalLink,
	MoreVertical,
	Pencil,
	RefreshCcw,
	Trash,
	X,
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
import { Spinner } from '~/components/ui/spinner'
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
} from '../context'
import type { action } from '../resource'

const productIdAtom = atom(get => get(productAtom)?.id ?? null)
const productNameAtom = atom(get => get(productAtom)?.name ?? null)
const productSlugAtom = atom(get => get(productAtom)?.slug ?? null)

export function ProductEditPageHeader() {
	const store = useStore()
	const [isSaving, setIsSaving] = useAtom(isSavingAtom)
	const storeConfig = useAtomValue(storeConfigAtom)
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)
	const productSlug = useAtomValue(productSlugAtom)
	const isMovingToTrash = useAtomValue(isMovingToTrashAtom)
	const setResetOpen = useSetAtom(isResetAlertOpenAtom)
	const setToTrashOpen = useSetAtom(isToTrashAlertOpenAtom)
	const setProduct = useSetAtom(productAtom)

	const isNew = productId === -1

	const [slugInput, setSlugInput] = useState(productSlug || '')
	const [editSlug, setEditSlug] = useState(false)

	const fetcher = useFetcher<typeof action>()
	const navigate = useNavigate()
	const { isSubmitting } = useFetcherNotification(fetcher, {
		onSuccess: () => {
			if (isNew) {
				navigate(`../${productSlug}`)
			}
		},
	})

	useEffect(() => setIsSaving(isSubmitting), [fetcher.state])

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

	if (!productId || productName === null || productSlug === null) return null

	return (
		<Item className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b-border sticky top-0 z-10 overflow-auto rounded-none py-2 backdrop-blur">
			<ItemContent>
				<ItemTitle className="truncate whitespace-nowrap">
					<span className="text-muted-foreground">
						({!isNew ? 'Edit' : 'Create'}){' '}
					</span>
					{productName}
					{!isNew && (
						<span className="text-muted-foreground">ID: {productId}</span>
					)}
				</ItemTitle>
				<ItemDescription className="flex items-center gap-1 truncate overflow-visible whitespace-nowrap">
					{editSlug ? (
						<>
							<span className="text-muted-foreground text-sm">
								{storeConfig.storeFrontPath}/product/
							</span>
							<Input
								className="text-primary h-7 w-fit px-2"
								type="text"
								placeholder="enter slug..."
								value={slugInput}
								onChange={e => setSlugInput(e.target.value)}
								autoFocus
							/>
							<Button
								size="icon"
								className="size-7"
								onClick={() => {
									setProduct(pv => (pv ? { ...pv, slug: slugInput } : pv))
									setEditSlug(false)
								}}
							>
								<Check />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-7"
								onClick={() => {
									setSlugInput(productSlug)
									setEditSlug(false)
								}}
							>
								<X />
							</Button>
						</>
					) : (
						<>
							<span className="text-muted-foreground truncate text-sm">
								{storeConfig.storeFrontPath}/product/{productSlug}
							</span>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground size-6"
								onClick={() => setEditSlug(true)}
							>
								<Pencil />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground size-6"
								asChild
							>
								<Link
									to={`${storeConfig.storeFrontPath}/product/${productSlug}?preview=true`}
									target="_blank"
									rel="noreferrer"
								>
									<ExternalLink />
								</Link>
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

						{!isNew && (
							<DropdownMenuItem
								className="focus:bg-destructive/90 flex items-center gap-2 focus:text-white"
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
