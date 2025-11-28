import { Fragment, memo, useEffect, useMemo, useState } from 'react'

import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
	type ColumnDef,
	type ExpandedState,
	type Row,
} from '@tanstack/react-table'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { ChevronDown, ChevronRight, Grid, Plus } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'
import {
	productAtom,
	storeConfigAtom,
} from '~/routes/services/ecommerce/store/product/context'
import { getVariantOptions } from '~/routes/services/ecommerce/store/product/utils/attributes'
import { formatPrice } from '~/routes/services/ecommerce/store/product/utils/price'

import { OptionForm } from './option-form'

type VariantType = NonNullable<
	ReturnType<typeof productAtom.read>
>['variants'][number]

const productAttributesAtom = atom(
	get => get(productAtom)?.attributes.sort((a, b) => a.order - b.order) || null,
)
const productVariantsAtom = atom(
	get => get(productAtom)?.variants.sort((a, b) => a.order - b.order) || null,
)

// Split the variants array into individual atoms
const variantAtomFamily = atomFamily((variantId: number) => {
	return atom(
		get => get(productAtom)?.variants?.find(v => v.id === variantId) || null,
	)
})

/**
 * Variants Component
 * Renders the list of product variants with their respective option forms.
 * Shows all combinations in a card preview, with edit capability via dialog and accordion.
 * @see https://tanstack.com/table/latest/docs/framework/react/examples/expanding?panel=sandbox
 * @link [ProductVariant](../../../../lib/db/product.server.ts)
 */
export function Variants() {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [expanded, setExpanded] = useState<ExpandedState>({})
	const [focusedRowId, setFocusedRowId] = useState<string | null>(null)

	// Effect to focus the expander button after dialog opens and row expands
	useEffect(() => {
		if (isDialogOpen && focusedRowId) {
			// Wait for next tick to ensure DOM is updated
			const timer = setTimeout(() => {
				const expanderButton = document.querySelector(
					`button[aria-expanded="true"][data-row-id="${focusedRowId}"]`,
				) as HTMLButtonElement

				if (expanderButton) {
					expanderButton.focus()
					setFocusedRowId(null) // Reset after focusing
				}
			}, 100)

			return () => clearTimeout(timer)
		}
	}, [isDialogOpen, focusedRowId])

	const handleEditClick = (variantId: number) => {
		const rowId = variantId.toString()
		setExpanded({ [rowId]: true })
		setFocusedRowId(rowId)
		setIsDialogOpen(true)
	}

	return (
		<>
			<VariantCard
				onEditVariant={handleEditClick}
				onOpen={() => setIsDialogOpen(true)}
			/>
			<VariantDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				expanded={expanded}
				setExpanded={setExpanded}
			/>
		</>
	)
}

function VariantCard({
	onEditVariant,
	onOpen,
}: {
	onEditVariant: (variantId: number) => void
	onOpen: () => void
}) {
	const storeConfig = useAtomValue(storeConfigAtom)
	const productVariants = useAtomValue(productVariantsAtom)

	const noVariants = !productVariants || productVariants.length === 0

	return (
		<Card id="variants">
			<CardHeader>
				<CardTitle>Product Variants</CardTitle>
				<CardDescription>
					Manage detail of different variants of your product.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[360px] space-y-2">
				{noVariants ? (
					<p className="text-muted-foreground rounded-md border border-dashed p-3 text-center text-sm">
						No variants available. Click "Add Variant" to create one.
					</p>
				) : (
					productVariants.map(v => {
						const fmt = new Intl.NumberFormat(storeConfig.language, {
							style: 'currency',
							currency: v.option.currency,
							minimumFractionDigits: v.option.scale,
							maximumFractionDigits: v.option.scale,
						})

						return (
							<div
								key={v.id}
								className="flex items-center justify-between gap-2 overflow-scroll rounded-md border p-3"
							>
								<div className="flex-1">
									<p>
										{Object.entries(v.combination).map(([key, value], i) => (
											<Fragment key={key}>
												{i !== 0 && (
													<span className="text-muted-foreground"> ⨉ </span>
												)}
												<span className="text-sm font-medium">{key}</span>
												<span className="bg-muted ml-1 border px-1 py-0.5 text-xs">
													{value}
												</span>
											</Fragment>
										))}
									</p>
									<p className="text-muted-foreground mt-2 text-xs">
										{v.option.sku || 'No SKU'} •{' '}
										{fmt.format(
											formatPrice(
												v.option.price,
												v.option.scale,
											) as Intl.StringNumericLiteral,
										)}
									</p>
								</div>
								<Button
									size="sm"
									variant="outline"
									onClick={() => onEditVariant(v.id)}
								>
									Edit
								</Button>
							</div>
						)
					})
				)}
			</CardContent>
			<CardFooter className="flex-col gap-2 md:flex-row">
				<Button
					variant="outline"
					size="sm"
					className="w-full md:w-auto md:flex-1"
					onClick={() => alert('Not implemented')}
				>
					<Plus />
					Add Variant
				</Button>
				<Button
					variant="secondary"
					size="sm"
					className="w-full border md:w-auto md:flex-1"
					onClick={() => {
						if (noVariants) return
						onOpen()
					}}
					disabled={noVariants}
				>
					<Grid />
					Open Manager
				</Button>
			</CardFooter>
		</Card>
	)
}

function VariantDialog({
	open,
	onOpenChange,
	expanded,
	setExpanded,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	expanded: ExpandedState
	setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>
}) {
	const productAttributes = useAtomValue(productAttributesAtom)
	const productVariants = useAtomValue(productVariantsAtom)

	const attrOptions = useMemo(() => {
		if (!productAttributes) return null

		return getVariantOptions(productAttributes)
	}, [productAttributes])

	const columns: ColumnDef<VariantType>[] = useMemo(() => {
		return [
			{
				id: 'expander',
				header: () => null,
				cell: ({ row }) => {
					return row.getCanExpand() ? (
						<Button
							onClick={row.getToggleExpandedHandler()}
							variant={'ghost'}
							size={'icon'}
							className="h-full w-full rounded-none focus:ring-0 focus-visible:ring-0"
							aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
							aria-expanded={row.getIsExpanded()}
							data-row-id={row.id}
						>
							{row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
						</Button>
					) : null
				},
				size: 50,
			},
			...(attrOptions
				? Object.keys(attrOptions).map(attrKey => ({
						id: attrKey,
						header: attrKey,
						cell: ({ row }: { row: Row<VariantType> }) => {
							const setProduct = useSetAtom(productAtom)
							const variant = row.original
							const currentValue = variant.combination[attrKey]
							const options = Array.from(attrOptions[attrKey]) || []

							const handleCombinationChange = (value: string) => {
								setProduct(prev => {
									if (!prev) return prev

									return {
										...prev,
										variants: prev.variants.map(v =>
											v.id === variant.id
												? {
														...v,
														combination: { ...v.combination, [attrKey]: value },
													}
												: v,
										),
									}
								})
							}

							return (
								<Select
									value={currentValue}
									onValueChange={handleCombinationChange}
								>
									<SelectTrigger className="h-8 w-full rounded-none">
										<SelectValue placeholder={`Select ${attrKey}`} />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										{options.map(option => {
											const exists = productVariants
												? productVariants.some(v => {
														const currentVCombination = {
															...variant.combination,
															[attrKey]: option,
														}
														// Check if there are variant that matches this option
														return Object.entries(currentVCombination).every(
															([key, value]) => v.combination[key] === value,
														)
													})
												: false

											return (
												<SelectItem
													key={option}
													value={option}
													className="rounded-none"
													disabled={exists}
												>
													{option}
												</SelectItem>
											)
										})}
									</SelectContent>
								</Select>
							)
						},
						size: 150,
					}))
				: []),
		]
	}, [attrOptions, productVariants])

	const table = useReactTable({
		data: productVariants ?? [],
		columns,
		state: {
			expanded,
		},
		onExpandedChange: setExpanded,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: () => true,
		getRowId: row => row.id.toString(),
	})

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card flex h-[85vh] w-full flex-col p-0 sm:max-w-[calc(100%-3rem)]">
				<DialogHeader className="flex-shrink-0 px-6 pt-6">
					<DialogTitle>Edit Variants</DialogTitle>
					<DialogDescription>
						Modify the options for each product variant below.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-auto px-6 pb-6">
					<div className="overflow-hidden border" role="grid">
						<div
							className="border-primary/30 grid border-b"
							style={{
								gridTemplateColumns: table
									.getHeaderGroups()[0]
									.headers.map(header => `${header.getSize()}px`)
									.join(' '),
							}}
							role="row"
						>
							{table.getHeaderGroups().map(g =>
								g.headers.map(header => (
									<div
										key={header.id}
										className="text-foreground px-4 py-3 text-sm font-medium"
										role="columnheader"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</div>
								)),
							)}
						</div>

						<div role="rowgroup">
							{table.getRowModel().rows.map(row => (
								<Fragment key={row.id}>
									<div
										className="hover:bg-accent/50 grid border-b last:border-b-0"
										style={{
											gridTemplateColumns: row
												.getVisibleCells()
												.map(cell => `${cell.column.getSize()}px`)
												.join(' '),
										}}
										role="row"
									>
										{row.getVisibleCells().map(cell => (
											<div
												key={cell.id}
												className={cn(
													'focus-within:bg-accent text-sm',
													cell.column.id === 'expander' ? 'p-0' : 'p-2',
												)}
												role="gridcell"
												tabIndex={-1}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</div>
										))}
									</div>

									{row.getIsExpanded() && (
										<div role="row">
											<div
												role="gridcell"
												style={{ gridColumn: '1 / -1' }}
												className="p-3"
											>
												<VariantRowExpand variantId={row.original.id} />
											</div>
										</div>
									)}
								</Fragment>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

/**
 * Individual Variant Item Component
 * Memoized to prevent re-renders when other variants change
 */
const VariantRowExpand = memo(({ variantId }: { variantId: number }) => {
	const setProduct = useSetAtom(productAtom)
	const variant = useAtomValue(variantAtomFamily(variantId))

	if (!variant) return null

	const handleOptionChange = (field: Partial<VariantType>) => {
		setProduct(prev => {
			if (!prev) return prev

			return {
				...prev,
				variants: prev.variants.map(v => {
					if (v.id === variantId) {
						return {
							...v,
							option: { ...v.option, ...field },
						}
					}
					return v
				}),
			}
		})
	}

	return <OptionForm option={variant.option} onChange={handleOptionChange} />
})
VariantRowExpand.displayName = 'VariantRowExpand'
