import { useEffect, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { useAtom, useAtomValue } from 'jotai'
import { ExternalLink, Plus, X } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Spinner } from '~/components/ui/spinner'
import type {
	CrossSellProduct,
	ProductListing,
	UpsellProduct,
} from '~/routes/services/ecommerce/lib/db/product.server'
import {
	crossSellProductsAtom,
	storeConfigAtom,
	upsellProductsAtom,
} from '~/routes/services/ecommerce/store/product/context'
import { formatPrice } from '~/routes/services/ecommerce/store/product/utils/price'

import type { loader } from '../resource'

export function LinkedProducts() {
	const fetcher = useFetcher<typeof loader>()

	const [productsAvailable, setProductsAvailable] = useState<ProductListing[]>(
		[],
	)
	const [productsLoaded, setProductsLoaded] = useState(false)

	const [crossSellProducts, setCrossSellProducts] = useAtom(
		crossSellProductsAtom,
	)
	const [upsellProducts, setUpsellProducts] = useAtom(upsellProductsAtom)

	const [isCSOpen, setIsCSOpen] = useState(false)
	const [isUSOpen, setIsUSOpen] = useState(false)

	useEffect(() => {
		if (!fetcher.data) return
		setProductsAvailable(fetcher.data.products)
		setProductsLoaded(true)
	}, [fetcher.data])

	const handleSetCSProducts = (products: CrossSellProduct[]) => {
		setCrossSellProducts(products)
		setIsCSOpen(false)
	}

	const handleSetUSProducts = (products: UpsellProduct[]) => {
		setUpsellProducts(products)
		setIsUSOpen(false)
	}

	const handleRemoveCSProduct = (productId: number) => {
		setCrossSellProducts(prev =>
			!prev ? null : prev.filter(p => p.id !== productId),
		)
	}

	const handleRemoveUSProduct = (productId: number) => {
		setUpsellProducts(prev =>
			!prev ? null : prev.filter(p => p.id !== productId),
		)
	}

	return (
		<div id="linked-products" className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Cross Sell Products</CardTitle>
					<CardDescription>
						These products will be shown as recommendations on the product page.
					</CardDescription>
				</CardHeader>

				<CardContent>
					{!crossSellProducts ? (
						<div className="flex items-center justify-center py-5">
							<Spinner />
						</div>
					) : crossSellProducts.length === 0 ? (
						/* Empty state */
						<div className="text-muted-foreground rounded-md border border-dashed px-2 py-5 text-center text-sm">
							No linked products yet. Click "Add Cross Sell Product" to get
							started.
						</div>
					) : (
						/* Product list */
						<div className="max-h-[360px] space-y-2 overflow-scroll">
							{crossSellProducts
								.sort((a, b) => a.order - b.order)
								.map(product => (
									<LinkedProductItem
										key={product.id}
										product={product}
										onRemove={handleRemoveCSProduct}
									/>
								))}
						</div>
					)}
				</CardContent>
				<CardFooter>
					<AddLinkedProductsDialog
						open={isCSOpen}
						onOpenChange={setIsCSOpen}
						onConfirm={handleSetCSProducts}
						selected={crossSellProducts ?? []}
						products={productsAvailable}
						isLoading={fetcher.state === 'loading'}
						trigger={
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								onClick={() => {
									!productsLoaded && fetcher.load('resource')
									setIsCSOpen(true)
								}}
							>
								<Plus />
								Add Cross Sell Product
							</Button>
						}
					/>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Upsell Products</CardTitle>
					<CardDescription>
						These products will be shown as recommendations on the cart page.
					</CardDescription>
				</CardHeader>

				<CardContent>
					{!upsellProducts ? (
						<div className="flex items-center justify-center py-5">
							<Spinner />
						</div>
					) : upsellProducts.length === 0 ? (
						/* Empty state */
						<div className="text-muted-foreground rounded-md border border-dashed px-2 py-5 text-center text-sm">
							No linked products yet. Click "Add Upsell Product" to get started.
						</div>
					) : (
						/* Product list */
						<div className="max-h-[360px] space-y-2 overflow-scroll">
							{upsellProducts
								.sort((a, b) => a.order - b.order)
								.map(product => (
									<LinkedProductItem
										key={product.id}
										product={product}
										onRemove={handleRemoveUSProduct}
									/>
								))}
						</div>
					)}
				</CardContent>
				<CardFooter>
					<AddLinkedProductsDialog
						open={isUSOpen}
						onOpenChange={setIsUSOpen}
						onConfirm={handleSetUSProducts}
						selected={upsellProducts ?? []}
						products={productsAvailable}
						isLoading={fetcher.state === 'loading'}
						trigger={
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								onClick={() => {
									!productsLoaded && fetcher.load('resource')
									setIsUSOpen(true)
								}}
							>
								<Plus />
								Add Upsell Product
							</Button>
						}
					/>
				</CardFooter>
			</Card>
		</div>
	)
}

interface LinkedProductItemProps {
	product: ProductListing
	onRemove: (productId: number) => void
}

function LinkedProductItem({ product, onRemove }: LinkedProductItemProps) {
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
		<div className="flex items-center gap-3 overflow-auto rounded-lg border p-3">
			{/* Product image */}
			<div className="size-16 shrink-0 overflow-hidden rounded-md">
				{product.option.image ? (
					<img
						src={product.option.image}
						alt={product.name}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-xs">
						❓
					</div>
				)}
			</div>

			{/* Product info */}
			<div className="flex flex-1 flex-col flex-wrap">
				<div className="font-medium text-nowrap">{product.name}</div>
				<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
					<p className="text-sm">
						{fmt.format(
							formatPrice(
								displayPrice,
								product.option.scale,
							) as Intl.StringNumericLiteral,
						)}
					</p>
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
			</div>

			{/* Actions */}
			<div className="flex items-center">
				<Button
					variant="ghost"
					size="icon"
					className="size-8"
					onClick={e => e.stopPropagation()}
					asChild
				>
					<Link to={`../${product.slug}`} target="_blank" rel="noreferrer">
						<ExternalLink />
					</Link>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onRemove(product.id)}
					className="size-8"
				>
					<X />
				</Button>
			</div>
		</div>
	)
}

interface AddLinkedProductsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (products: (ProductListing & { order: number })[]) => void
	selected: (ProductListing & { order: number })[]
	products: ProductListing[]
	isLoading: boolean
	/** Pass in trigger to auto focus on close */
	trigger?: React.ReactNode
}

// === Dialog for adding linked products ===

function AddLinkedProductsDialog({
	open,
	onOpenChange,
	onConfirm,
	selected,
	products,
	isLoading,
	trigger,
}: AddLinkedProductsDialogProps) {
	const [selectedProducts, setSelectedProducts] =
		useState<(ProductListing & { order: number })[]>(selected)
	const [search, setSearch] = useState('')

	useEffect(() => {
		setSelectedProducts(selected)
	}, [selected])

	const handleToggleProduct = (product: ProductListing) => {
		setSelectedProducts(prev => {
			const exists = prev.some(p => p.id === product.id)
			if (exists) {
				return prev
					.filter(p => p.id !== product.id)
					.map((p, index) => ({ ...p, order: index + 1 }))
			}
			return [...prev, { ...product, order: prev.length + 1 }]
		})
	}

	const handleConfirm = () => {
		if (selectedProducts.length > 0) {
			onConfirm(selectedProducts)
		}
	}

	const filteredProducts = products.filter(p =>
		p.name.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
				<DialogHeader className="shrink-0">
					<DialogTitle>Add Linked Products</DialogTitle>
					<DialogDescription>Select products to link.</DialogDescription>
				</DialogHeader>

				<Input
					className="shrink-0"
					placeholder="Search products..."
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>

				{/* Scrollable content area */}
				<div className="min-h-0 flex-1 overflow-y-auto">
					{/* Loading state */}
					{isLoading ? (
						<div className="flex items-center justify-center py-10">
							<Spinner />
						</div>
					) : filteredProducts.length === 0 ? (
						/* Empty state */
						<div className="text-muted-foreground flex items-center justify-center py-10 text-sm">
							No available products to link.
						</div>
					) : (
						/* Product selection list */
						<div className="space-y-2">
							{filteredProducts.map(product => {
								return (
									<SelectableProductItem
										key={product.id}
										product={product}
										selectedOrder={
											selectedProducts.find(p => p.id === product.id)?.order
										}
										onToggle={handleToggleProduct}
									/>
								)
							})}
						</div>
					)}
				</div>

				<DialogFooter className="shrink-0">
					<Button
						size={'sm'}
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						size={'sm'}
						onClick={handleConfirm}
						disabled={selectedProducts.length === 0}
					>
						Select{' '}
						{selectedProducts.length > 0 && `(${selectedProducts.length})`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

interface SelectableProductItemProps {
	product: ProductListing
	selectedOrder?: number
	onToggle: (product: ProductListing) => void
}

function SelectableProductItem({
	product,
	selectedOrder,
	onToggle,
}: SelectableProductItemProps) {
	const storeConfig = useAtomValue(storeConfigAtom)
	const isSelected = selectedOrder !== undefined

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
		<div
			className={`hover:bg-muted/50 flex min-w-0 cursor-pointer items-center gap-3 overflow-auto rounded-lg border p-3 transition-colors ${
				isSelected ? 'border-primary bg-primary/5' : ''
			}`}
			onClick={() => onToggle(product)}
		>
			{/* Checkbox */}
			<Checkbox
				checked={isSelected}
				onCheckedChange={() => onToggle(product)}
				onClick={e => e.stopPropagation()}
				icon={isSelected && <span className="text-xs">{selectedOrder}</span>}
			/>

			{/* Product image */}
			<div className="size-16 shrink-0 overflow-hidden rounded-md">
				{product.option.image ? (
					<img
						src={product.option.image}
						alt={product.name}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-xs">
						❓
					</div>
				)}
			</div>

			{/* Product info */}
			<div className="flex flex-1 flex-col flex-wrap">
				<div className="font-medium text-nowrap">{product.name}</div>
				<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
					<p className="text-sm">
						{fmt.format(
							formatPrice(
								displayPrice,
								product.option.scale,
							) as Intl.StringNumericLiteral,
						)}
					</p>
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
			</div>

			{/* External link button */}
			<Button
				variant="ghost"
				size="icon"
				className="size-8"
				onClick={e => e.stopPropagation()}
				asChild
			>
				<Link to={`../${product.slug}`} target="_blank" rel="noreferrer">
					<ExternalLink />
				</Link>
			</Button>
		</div>
	)
}
