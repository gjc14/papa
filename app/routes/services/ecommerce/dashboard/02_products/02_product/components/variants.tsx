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
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import {
	ChevronDown,
	ChevronRight,
	CircleMinus,
	ClipboardCopy,
	ClipboardPaste,
	Grid,
	Plus,
} from 'lucide-react'

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
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import { productAtom } from '~/routes/services/ecommerce/store/product/context'
import { getVariantAttributes } from '~/routes/services/ecommerce/store/product/utils/attributes'
import { renderPrice } from '~/routes/services/ecommerce/store/product/utils/price'

import {
	AttributeEditDialog,
	createNewAttribute,
	updateAttribute,
} from './attributes'
import { OptionForm } from './option-form'

type VariantType = NonNullable<
	ReturnType<typeof productAtom.read>
>['variants'][number]

const productAttributesAtom = atom(
	get => get(productAtom)?.attributes.sort((a, b) => a.order - b.order) ?? null,
)
const productVariantsAtom = atom(
	get => get(productAtom)?.variants.sort((a, b) => a.order - b.order) ?? null,
)

// Split the variants array into individual atoms
const variantAtomFamily = atomFamily((variantId: number) => {
	return atom(
		get => get(productAtom)?.variants?.find(v => v.id === variantId) ?? null,
	)
})

// === Utils ===

/** Pass in combination to see if it exists in variants */
function combinationExists({
	variants,
	combination,
}: {
	variants: VariantType[]
	combination: Record<string, string>
}) {
	return variants.some(v => {
		// Check if there are variant that matches this option
		return Object.entries(combination).every(
			([key, value]) => v.combination[key] === value,
		)
	})
}

/**
 * Variants Component
 * Renders the list of product variants with their respective option forms.
 * Shows all combinations in a card preview, with edit capability via dialog and accordion.
 * @see https://tanstack.com/table/latest/docs/framework/react/examples/expanding?panel=sandbox
 * @link [ProductVariant](../../../../lib/db/product.server.ts)
 */
export function Variants() {
	const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
	const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false)
	const [expanded, setExpanded] = useState<ExpandedState>({})
	const [focusedRowId, setFocusedRowId] = useState<string | null>(null)

	// Effect to focus the expander button after dialog opens and row expands
	useEffect(() => {
		if (isVariantDialogOpen && focusedRowId) {
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
	}, [isVariantDialogOpen, focusedRowId])

	const handleEditClick = (variantId: number) => {
		const rowId = variantId.toString()
		setExpanded({ [rowId]: true })
		setFocusedRowId(rowId)
		setIsVariantDialogOpen(true)
	}

	return (
		<>
			<VariantCard
				onEditVariant={handleEditClick}
				onOpenManager={() => setIsVariantDialogOpen(true)}
				onOpenAddVariant={() => setIsAddVariantDialogOpen(true)}
			/>
			<VariantManagementDialog
				open={isVariantDialogOpen}
				onOpenChange={setIsVariantDialogOpen}
				expanded={expanded}
				setExpanded={setExpanded}
				onOpenAddVariant={() => setIsAddVariantDialogOpen(true)}
			/>
			<AddVariantDialog
				open={isAddVariantDialogOpen}
				onOpenChange={setIsAddVariantDialogOpen}
			/>
		</>
	)
}

function VariantCard({
	onEditVariant,
	onOpenManager,
	onOpenAddVariant,
}: {
	onEditVariant: (variantId: number) => void
	onOpenManager: () => void
	onOpenAddVariant: () => void
}) {
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
			<CardContent className="max-h-[360px] space-y-2 overflow-auto">
				{noVariants ? (
					<p className="text-muted-foreground border border-dashed p-3 text-center text-xs">
						No variants available. Click "Generate Variants" to create one.
					</p>
				) : (
					productVariants.map(v => (
						<VariantItem key={v.id} variant={v} onEdit={onEditVariant} />
					))
				)}
			</CardContent>
			<CardFooter className="flex-col gap-2 md:flex-row">
				<Button
					variant="outline"
					size="sm"
					className="w-full md:w-auto md:flex-1"
					onClick={onOpenAddVariant}
				>
					<Plus />
					Generate Variants
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="w-full md:w-auto md:flex-1"
					onClick={() => {
						if (noVariants) return
						onOpenManager()
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

function VariantItem({
	variant,
	onEdit,
}: {
	variant: VariantType
	onEdit: (id: number) => void
}) {
	const { hasDiscount, formattedPrice, formattedOriginalPrice } = renderPrice(
		variant.option,
	)

	return (
		<div className="flex items-center justify-between gap-2 overflow-scroll border p-3">
			<div className="flex-1">
				<p className="text-muted-foreground text-xs">
					{variant.option.sku || '- (sku)'}
				</p>
				<p>
					{Object.entries(variant.combination).map(([attr, val], i) => (
						<Fragment key={attr}>
							{i !== 0 && <span className="text-muted-foreground"> ⨉ </span>}
							<span className="text-sm font-medium">{attr}</span>
							<span className="bg-muted ml-1 border px-1 py-0.5 text-xs">
								{val}
							</span>
						</Fragment>
					))}
				</p>
				<p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-xs font-bold">
					{formattedPrice}
					{hasDiscount && (
						<span className="font-normal line-through">
							{formattedOriginalPrice}
						</span>
					)}
				</p>
			</div>
			<Button size="sm" variant="outline" onClick={() => onEdit(variant.id)}>
				Edit
			</Button>
		</div>
	)
}

function VariantActionCell({ row }: { row: Row<VariantType> }) {
	const setProduct = useSetAtom(productAtom)
	const [copyState, setCopyState] = useState({
		open: false,
		copied: false,
	})
	const [pasteState, setPasteState] = useState({
		open: false,
		pasted: false,
	})

	return (
		<div className="flex items-center gap-1">
			<Tooltip
				open={copyState.open}
				onOpenChange={open => {
					setCopyState(prev => ({
						open,
						copied: open ? false : prev.copied,
					}))
				}}
			>
				<TooltipTrigger
					delay={800}
					render={
						<Button
							onClick={() => {
								const option = row.original.option
								navigator.clipboard.writeText(
									JSON.stringify(option, (_, v) =>
										typeof v === 'bigint' ? v.toString() : v,
									),
								)
								setCopyState({ open: true, copied: true })
							}}
							variant={'ghost'}
							size={'icon'}
							className="hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground size-6 rounded-full focus:ring-0 focus-visible:ring-0"
						>
							<ClipboardCopy />
						</Button>
					}
				/>
				<TooltipContent>
					<p className="text-sm">
						{copyState.copied ? 'Copied' : 'Copy variant'}
					</p>
				</TooltipContent>
			</Tooltip>

			<Tooltip
				open={pasteState.open}
				onOpenChange={open => {
					setPasteState(prev => ({
						open,
						pasted: open ? false : prev.pasted,
					}))
				}}
			>
				<TooltipTrigger
					delay={800}
					render={
						<Button
							onClick={async () => {
								const clipboardData = await navigator.clipboard.readText()

								const option = JSON.parse(clipboardData)

								const updatedOption = {
									...option,
									price: BigInt(option.price),
									salePrice: option.salePrice ? BigInt(option.salePrice) : null,
								}

								setProduct(prev => {
									if (!prev) return prev

									return {
										...prev,
										variants: prev.variants.map(v => {
											if (v.id === row.original.id) {
												return {
													...v,
													option: {
														...v.option,
														...updatedOption,
													},
												}
											}
											return v
										}),
									}
								})

								setPasteState({ open: true, pasted: true })
							}}
							variant={'ghost'}
							size={'icon'}
							className="hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground size-6 rounded-full focus:ring-0 focus-visible:ring-0"
						>
							<ClipboardPaste />
						</Button>
					}
				/>
				<TooltipContent>
					<p className="text-sm">
						{pasteState.pasted ? 'Pasted' : 'Paste variant'}
					</p>
				</TooltipContent>
			</Tooltip>
		</div>
	)
}

function VariantManagementDialog({
	open,
	onOpenChange,
	expanded,
	setExpanded,
	onOpenAddVariant,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	expanded: ExpandedState
	setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>
	onOpenAddVariant: () => void
}) {
	const productAttributes = useAtomValue(productAttributesAtom)
	const productVariants = useAtomValue(productVariantsAtom)
	const setProduct = useSetAtom(productAtom)

	const attrOptions = useMemo(() => {
		if (!productAttributes) return null

		return getVariantAttributes(productAttributes)
	}, [productAttributes])

	const columns: ColumnDef<VariantType>[] = useMemo(() => {
		return [
			{
				id: '_expander',
				header: () => null,
				cell: ({ row }: { row: Row<VariantType> }) => {
					return row.getCanExpand() ? (
						<Button
							onClick={row.getToggleExpandedHandler()}
							variant={'ghost'}
							size={'icon'}
							className="h-full w-full focus:ring-0 focus-visible:ring-0"
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
				? Object.entries(attrOptions).map(([attr, optSet]) => ({
						id: attr,
						header: () => {
							if (!productAttributes) return null

							const a = productAttributes.find(a => a.name === attr)
							if (!a) return attr

							return (
								<AttributeEditDialog
									attribute={a}
									onSave={a => {
										if (!productAttributes || !productVariants) return
										const { updatedAttributes, updatedVariants } =
											updateAttribute(a, productAttributes, productVariants)

										setProduct(prev => {
											if (!prev) return prev
											return {
												...prev,
												attributes: updatedAttributes,
												variants: updatedVariants,
											}
										})
									}}
								>
									<Button
										variant="link"
										size="sm"
										className="h-6"
										render={<DialogTrigger>{attr}</DialogTrigger>}
									/>
								</AttributeEditDialog>
							)
						},
						cell: ({ row }: { row: Row<VariantType> }) => {
							const setProduct = useSetAtom(productAtom)
							const variant = row.original
							const currentValue = variant.combination[attr] || ''
							const options = Array.from(optSet)

							const handleCombinationChange = (value: string) => {
								setProduct(prev => {
									if (!prev) return prev

									return {
										...prev,
										variants: prev.variants.map(v =>
											v.id === variant.id
												? {
														...v,
														combination: { ...v.combination, [attr]: value },
													}
												: v,
										),
									}
								})
							}

							return (
								<Select
									value={currentValue}
									onValueChange={v => v && handleCombinationChange(v)}
								>
									<SelectTrigger className="h-8 w-full">
										<SelectValue placeholder={`Select ${attr}`} />
									</SelectTrigger>
									<SelectContent className="">
										{options.map(option => {
											const exists = productVariants
												? combinationExists({
														variants: productVariants,
														combination: {
															...variant.combination,
															[attr]: option,
														},
													})
												: false

											return (
												<SelectItem
													key={option}
													value={option}
													className=""
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
			{
				id: '_action',
				cell: VariantActionCell,
				size: 80,
			},
			{
				id: '_',
				header: () =>
					productAttributes ? (
						<AttributeEditDialog
							attribute={createNewAttribute(productAttributes)}
							onSave={a => {
								setProduct(prev => {
									if (!prev) return prev
									return {
										...prev,
										attributes: [...prev.attributes, a],
									}
								})
							}}
						>
							<Button
								variant="outline"
								size="sm"
								className="size-6"
								render={
									<DialogTrigger>
										<Plus />
									</DialogTrigger>
								}
							/>
						</AttributeEditDialog>
					) : null,
				cell: ({ row }) => (
					<Button
						onClick={() => {
							const variantId = row.original.id
							setProduct(prev => {
								if (!prev) return prev

								return {
									...prev,
									variants: prev.variants
										.filter(v => v.id !== variantId)
										.map((v, i) => ({
											...v,
											order: i,
										})),
								}
							})
						}}
						variant={'destructive'}
						size={'icon'}
						className="size-6 rounded-full focus:ring-0 focus-visible:ring-0"
					>
						<CircleMinus />
					</Button>
				),
				size: 50,
			},
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

				<div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
					<div className="relative flex-1 overflow-auto border" role="grid">
						<div
							className="bg-card border-primary/30 sticky top-0 z-10 grid w-full min-w-fit border-b"
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
										className="text-foreground flex items-center justify-center px-3 py-2 text-sm font-medium"
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
										className="hover:bg-accent/50 grid w-full min-w-fit border-b last:border-b-0"
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
													'focus-within:bg-accent flex items-center justify-center text-sm',
													cell.column.id === '_expander' ? 'p-0' : 'p-2',
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

						<div role="rowgroup">
							<div
								className="bg-muted/30 grid w-full min-w-fit border-t"
								style={{
									gridTemplateColumns: table
										.getHeaderGroups()[0]
										.headers.map(header => `${header.getSize()}px`)
										.join(' '),
								}}
								role="row"
							>
								<div
									role="gridcell"
									style={{ gridColumn: '1 / -1' }}
									className="p-3"
								>
									<Button
										size="sm"
										variant="outline"
										onClick={onOpenAddVariant}
									>
										<Plus />
										Generate Variants
									</Button>
								</div>
							</div>
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
	const [product, setProduct] = useAtom(productAtom)
	const variant = useAtomValue(variantAtomFamily(variantId))

	if (!product || !variant) return null

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

	return (
		<OptionForm
			option={variant.option}
			onChange={handleOptionChange}
			parentOption={product.option}
		/>
	)
})
VariantRowExpand.displayName = 'VariantRowExpand'

function AddVariantDialog({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const [product, setProduct] = useAtom(productAtom)
	const productAttributes = useAtomValue(productAttributesAtom)
	const productVariants = useAtomValue(productVariantsAtom)

	const [newVariantCombination, setNewVariantCombination] = useState<
		Record<string, string>
	>({})

	const attrOptions = useMemo(() => {
		if (!productAttributes) return null

		return getVariantAttributes(productAttributes)
	}, [productAttributes])

	const handleGenerate = () => {
		if (!attrOptions || !productVariants || !product) return

		// Generate all combinations based on selected options
		const newVariants: VariantType[] = []

		// Convert attrOptions to array of [key, values[]] pairs
		const entries = Object.entries(attrOptions).map(
			([key, valueSet]) => [key, Array.from(valueSet)] as const,
		)

		let combinations: Record<string, string>[] = [{}]

		for (const [key, valueArray] of entries) {
			const newCombinations: Record<string, string>[] = []
			for (const combination of combinations) {
				for (const value of valueArray) {
					// Use selected value if exists
					if (key in newVariantCombination) {
						if (value !== newVariantCombination[key]) continue // skip non-matching
					}
					newCombinations.push({ ...combination, [key]: value })
				}
			}
			combinations = newCombinations
		}

		combinations.forEach(combination => {
			if (!combinationExists({ variants: productVariants, combination })) {
				const newId = -(Math.floor(Math.random() * 2147483648) + 1) // id doesn't matter, backend will delete all and recreate
				newVariants.push({
					id: newId, // id doesn't matter, backend will delete all and recreate
					// postgres integer -2147483648 to +2147483647
					productId: product.id,
					order: productVariants
						? productVariants.length + newVariants.length
						: 0,
					combination,

					optionId: newId, // id doesn't matter, backend will delete all and recreate
					option: {
						...product.option,
						id: newId,
						image: '',
						imageAlt: '',
						imageTitle: '',
					},
				})
			}
		})

		// Update product with new variants
		if (newVariants.length > 0) {
			setProduct(prev => {
				if (!prev) return prev

				return {
					...prev,
					variants: [...prev.variants, ...newVariants],
				}
			})
			setNewVariantCombination({})
		}
	}

	const quantityToGenerate = useMemo(() => {
		if (!attrOptions || Object.keys(attrOptions).length === 0) return 0

		return Object.entries(attrOptions).reduce(
			(acc, [attr, opts]) =>
				acc * (attr in newVariantCombination ? 1 : opts.size),
			1,
		)
	}, [attrOptions, newVariantCombination])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Generate Variants</DialogTitle>
					<DialogDescription>
						Select options to generate one or multiple new product variants.
					</DialogDescription>
				</DialogHeader>
				{attrOptions && Object.keys(attrOptions).length > 0 ? (
					<>
						<div className="flex flex-col gap-2">
							{Object.entries(attrOptions).map(([attr, optSet]) => {
								const options = Array.from(optSet)

								return (
									<div key={attr} className="flex items-center gap-2">
										<Select
											value={newVariantCombination[attr] || ''}
											onValueChange={v =>
												v &&
												setNewVariantCombination(prev => ({
													...prev,
													[attr]: v,
												}))
											}
										>
											<SelectTrigger className="h-8 w-full">
												<SelectValue
													placeholder={`Select ${attr} (${options.length})`}
												/>
											</SelectTrigger>
											<SelectContent className="">
												{options.map(option => {
													return (
														<SelectItem
															key={option}
															value={option}
															className=""
														>
															{option}
														</SelectItem>
													)
												})}
											</SelectContent>
										</Select>
										<Button
											variant={
												newVariantCombination[attr] ? 'ghost' : 'secondary'
											}
											size={'sm'}
											onClick={() => {
												setNewVariantCombination(prev => {
													const { [attr]: _, ...rest } = prev
													return rest
												})
											}}
										>
											Auto
										</Button>
									</div>
								)
							})}
						</div>
						<DialogFooter>
							<Button
								size={'sm'}
								onClick={() => {
									if (quantityToGenerate > 99) {
										const confirm = window.confirm(
											`You are about to generate ${quantityToGenerate} variants.`,
										)
										if (!confirm) return
									}

									handleGenerate()
									onOpenChange(false)
									setNewVariantCombination({})
								}}
								disabled={quantityToGenerate === 0}
							>
								{`Generate ${quantityToGenerate} variant${
									quantityToGenerate > 1 ? 's' : ''
								}`}
							</Button>
						</DialogFooter>
					</>
				) : (
					<p className="text-muted-foreground border border-dashed p-3 text-center text-xs">
						No attributes available to generate variant options. Please add
						product attributes first.
					</p>
				)}
			</DialogContent>
		</Dialog>
	)
}
