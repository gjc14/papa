import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { useAtom, useAtomValue } from 'jotai'
import {
	DownloadCloud,
	DownloadIcon,
	Image,
	InfoIcon,
	Link2,
	Link2Off,
	PackageIcon,
	Plus,
	SettingsIcon,
	TruckIcon,
	X,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import { CardTitle } from '~/components/ui/card'
import { DialogTrigger } from '~/components/ui/dialog'
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import { AssetSelectionDialog } from '~/components/asset-selection-dialog'
import { SeparatorWithText } from '~/components/separator-with-text'
import type { loader } from '~/routes/papa/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/papa/dashboard/assets/utils'
import {
	StockStatus,
	type DownloadFile,
} from '~/routes/services/ecommerce/lib/db/schema/product'
import { renderPrice } from '~/routes/services/ecommerce/store/product/utils/price'

import { productAtom, storeConfigAtom } from '../../../../store/product/context'
import { assetsAtom } from '../../../context'

export type ProductOptionType = NonNullable<
	ReturnType<typeof productAtom.read>
>['option']

export function isFieldInherited<K extends keyof ProductOptionType>(
	option: ProductOptionType,
	parentOption: ProductOptionType | undefined,
	field: K,
): boolean {
	if (!parentOption) return false

	const optionValue = option[field]
	const parentValue = parentOption[field]

	if (typeof optionValue === 'bigint' && typeof parentValue === 'bigint') {
		return optionValue === parentValue
	}

	if (optionValue instanceof Date && parentValue instanceof Date) {
		return optionValue.getTime() === parentValue.getTime()
	}

	if (typeof optionValue === 'object' && typeof parentValue === 'object') {
		return JSON.stringify(optionValue) === JSON.stringify(parentValue)
	}

	if (Array.isArray(optionValue) && Array.isArray(parentValue)) {
		return JSON.stringify(optionValue) === JSON.stringify(parentValue)
	}

	return optionValue === parentValue
}

function handleInherit<K extends keyof ProductOptionType>(
	field: K,
	parentOption: ProductOptionType | undefined,
	onChange: (field: Partial<ProductOptionType>) => void,
) {
	if (!parentOption) return
	onChange({ [field]: parentOption[field] })
}

interface InheritButtonProps {
	isInherited: boolean
	onInherit: () => void
	parentValue?: string | number | null
}

function InheritButton({
	isInherited,
	onInherit,
	parentValue,
}: InheritButtonProps) {
	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant={isInherited ? 'secondary' : 'ghost'}
					className="size-6"
					onClick={onInherit}
				>
					{isInherited ? <Link2 /> : <Link2Off />}
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right">
				<div className="text-xs">
					{isInherited ? (
						<>
							<div className="font-medium">Inherited from product</div>
							{!!parentValue && (
								<div className="text-muted-foreground">
									Value: {parentValue}
								</div>
							)}
						</>
					) : (
						'Click to inherit from product'
					)}
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

interface OptionFormProps {
	option: ProductOptionType
	onChange: (field: Partial<ProductOptionType>) => void
	/** Pass in parent option if this is a variant */
	parentOption?: ProductOptionType
	/** Pass in inherited fields if this is a variant */
}

export function OptionForm({
	option,
	onChange,
	parentOption,
}: OptionFormProps) {
	const isVariant = !!parentOption

	const storeConfig = useAtomValue(storeConfigAtom)

	const fetcher = useFetcher<typeof loader>()
	const [assets, setAssets] = useAtom(assetsAtom)
	const [openSelectFeature, setOpenSelectFeature] = useState(false)
	const [srcInput, setSrcInput] = useState('')
	const [altInput, setAltInput] = useState('')
	const [titleInput, setTitleInput] = useState('')

	const checkInherited = (field: keyof ProductOptionType) =>
		isVariant && isFieldInherited(option, parentOption, field)

	const applyInherit = (field: keyof ProductOptionType) =>
		handleInherit(field, parentOption, onChange)

	const tabConfig = [
		{ value: 'general', icon: SettingsIcon, label: 'General' },
		{ value: 'inventory', icon: PackageIcon, label: 'Inventory' },
		{ value: 'shipping', icon: TruckIcon, label: 'Shipping' },
		{ value: 'digital', icon: DownloadIcon, label: 'Digital' },
		{ value: 'others', icon: InfoIcon, label: 'Others' },
	] as const

	const { hasDiscount, formattedPrice, formattedOriginalPrice } =
		renderPrice(option)

	useEffect(() => {
		if (fetcher.data) setAssets(fetcher.data)
	}, [fetcher.data])

	return (
		<FieldSet className="h-full w-full">
			<Tabs
				defaultValue={tabConfig[0].value}
				orientation="vertical"
				className="flex h-full w-full flex-row gap-1"
			>
				<TabsList asChild>
					<Field
						orientation={'vertical'}
						className="h-auto w-fit justify-start gap-2"
					>
						{tabConfig.map(({ value, icon: Icon, label }) => (
							<Tooltip delayDuration={0} key={value}>
								<TooltipTrigger asChild>
									<span>
										<TabsTrigger
											value={value}
											className="h-9 w-9 cursor-pointer p-2"
											disabled={isVariant ? !option.active : false}
										>
											<Icon size={16} />
										</TabsTrigger>
									</span>
								</TooltipTrigger>
								<TooltipContent side="right" className="px-2 py-1 text-xs">
									{label}
								</TooltipContent>
							</Tooltip>
						))}
					</Field>
				</TabsList>

				<div className="flex grow flex-col overflow-hidden rounded-md border">
					<TabsContent
						tabIndex={-1}
						value="general"
						className={`m-0 flex h-[360px] flex-col gap-3 overflow-y-scroll p-3 pb-12`}
					>
						<CardTitle className="my-1 mb-3">General</CardTitle>

						<FieldGroup>
							{isVariant && (
								<Field orientation="horizontal">
									<FieldContent>
										<FieldLabel htmlFor="active">Variant Active</FieldLabel>
										<FieldDescription>
											Toggle to activate or deactivate this product variant.
										</FieldDescription>
									</FieldContent>
									<Switch
										id="active"
										checked={option.active === 1}
										onCheckedChange={checked =>
											onChange({ active: checked ? 1 : 0 })
										}
									/>
								</Field>
							)}

							{isVariant && !option.active ? null : (
								<>
									{isVariant && (
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="price">Variant Image</FieldLabel>
											<AssetSelectionDialog
												actionLabel="Set as Feature Image"
												title="Image"
												trigger={
													<DialogTrigger
														onClick={() =>
															!assets && fetcher.load(assetResourceRoute)
														}
														asChild
													>
														{option.image ? (
															<div className="relative w-[80px]!">
																<button
																	type="button"
																	onClick={e => {
																		e.stopPropagation()
																		onChange({
																			image: null,
																			imageAlt: null,
																			imageTitle: null,
																		})
																	}}
																	className="bg-destructive absolute top-0.5 right-0.5 cursor-pointer rounded-full p-0.5 text-white hover:opacity-80"
																>
																	<X size={12} />
																</button>
																<img
																	src={option.image}
																	alt={option.imageAlt || ''}
																	title={option.imageTitle || ''}
																	className="aspect-square h-full w-full cursor-pointer rounded-md border object-cover"
																/>
															</div>
														) : (
															<div className="bg-accent flex aspect-square w-[80px]! cursor-pointer items-center justify-center rounded-md border border-dashed">
																<Image />
															</div>
														)}
													</DialogTrigger>
												}
												assets={assets}
												isLoading={fetcher.state === 'loading'}
												open={openSelectFeature}
												onOpenChange={open => {
													setOpenSelectFeature(open)
													if (open) {
														setSrcInput(option.image || '')
														setAltInput(option.imageAlt || '')
														setTitleInput(option.imageTitle || '')
													} else {
														setSrcInput('')
														setAltInput('')
														setTitleInput('')
													}
												}}
												srcInput={srcInput}
												setSrcInput={setSrcInput}
												altInput={altInput}
												setAltInput={setAltInput}
												titleInput={titleInput}
												setTitleInput={setTitleInput}
												onAction={() => {
													onChange({
														image: srcInput,
														imageAlt: altInput,
														imageTitle: titleInput,
													})
													setOpenSelectFeature(false)
												}}
											/>
										</Field>
									)}

									<FieldGroup className="sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="price" className="items-center">
												Regular Price
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('price')}
														onInherit={() => applyInherit('price')}
														parentValue={formattedOriginalPrice}
													/>
												)}
											</FieldLabel>
											<Input
												id="price"
												type="text"
												value={option.price.toString()}
												onChange={e => {
													onChange({
														price: e.target.value
															? BigInt(e.target.value)
															: BigInt(0),
													})
												}}
												autoFocus={isVariant}
												className={
													checkInherited('price')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription className="bg-brand text-brand-foreground border px-1 py-0.5 break-words">
												{formattedOriginalPrice}
											</FieldDescription>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="sale-price" className="items-center">
												Sale Price
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('salePrice')}
														onInherit={() => applyInherit('salePrice')}
														parentValue={
															parentOption?.salePrice
																? parentOption.salePrice.toString()
																: null
														}
													/>
												)}
											</FieldLabel>
											<Input
												id="sale-price"
												type="text"
												placeholder={'999'}
												value={option.salePrice?.toString() || ''}
												onChange={e => {
													onChange({
														salePrice: e.target.value
															? BigInt(e.target.value)
															: null,
													})
												}}
												className={
													checkInherited('salePrice')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription className="bg-brand text-brand-foreground border px-1 py-0.5 break-words">
												{option.salePrice && hasDiscount ? formattedPrice : '-'}
											</FieldDescription>
										</Field>
									</FieldGroup>

									<FieldGroup className="sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="scale" className="items-center">
												Scale
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('scale')}
														onInherit={() => applyInherit('scale')}
														parentValue={parentOption?.scale}
													/>
												)}
											</FieldLabel>
											<Input
												id="scale"
												type="number"
												value={option.scale}
												onChange={e => {
													if (Number.isNaN(e.target.value)) return
													if (Number(e.target.value) > 100) return

													onChange({
														scale:
															Math.abs(Number.parseInt(e.target.value)) || 0,
													})
												}}
												min={0}
												placeholder="2"
												className={
													checkInherited('scale')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription>
												Number of decimal places for prices.
											</FieldDescription>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="currency" className="items-center">
												Currency
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('currency')}
														onInherit={() => applyInherit('currency')}
														parentValue={parentOption?.currency}
													/>
												)}
											</FieldLabel>
											<Select
												value={option.currency}
												onValueChange={value => onChange({ currency: value })}
											>
												<SelectTrigger
													className={
														checkInherited('currency')
															? 'text-muted-foreground border-dashed'
															: ''
													}
												>
													<SelectValue placeholder="Choose currency" />
												</SelectTrigger>
												<SelectContent>
													{Intl.supportedValuesOf('currency').map(
														currencyCode => (
															<SelectItem
																key={currencyCode}
																value={currencyCode}
															>
																{currencyCode}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
										</Field>
									</FieldGroup>

									<SeparatorWithText text="Sale Period" />

									<FieldGroup className="sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel
												htmlFor="sale-starts-at"
												className="items-center"
											>
												Sale Starts At
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('saleStartsAt')}
														onInherit={() => applyInherit('saleStartsAt')}
														parentValue={parentOption?.saleStartsAt?.toLocaleString()}
													/>
												)}
											</FieldLabel>
											<Input
												id="sale-starts-at"
												type="datetime-local"
												value={
													option.saleStartsAt
														? option.saleStartsAt.toISOString().slice(0, 16)
														: ''
												}
												onChange={e =>
													onChange({
														saleStartsAt: e.target.value
															? new Date(e.target.value)
															: undefined,
													})
												}
												disabled={!option.salePrice}
												className={
													checkInherited('saleStartsAt')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel
												htmlFor="sale-ends-at"
												className="items-center"
											>
												Sale Ends At
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('saleEndsAt')}
														onInherit={() => applyInherit('saleEndsAt')}
														parentValue={parentOption?.saleEndsAt?.toLocaleString()}
													/>
												)}
											</FieldLabel>
											<Input
												id="sale-ends-at"
												type="datetime-local"
												value={
													option.saleEndsAt
														? option.saleEndsAt.toISOString().slice(0, 16)
														: ''
												}
												onChange={e =>
													onChange({
														saleEndsAt: e.target.value
															? new Date(e.target.value)
															: undefined,
													})
												}
												disabled={!option.salePrice}
												className={
													checkInherited('saleEndsAt')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
										</Field>
									</FieldGroup>

									<SeparatorWithText text="Quantity Limits" />

									<FieldGroup className="sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="in-batch" className="items-center">
												In Batch Quantity
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('step')}
														onInherit={() => applyInherit('step')}
														parentValue={parentOption?.step}
													/>
												)}
											</FieldLabel>
											<Input
												id="in-batch"
												type="number"
												value={option.step}
												onChange={e =>
													onChange({
														step: e.target.value
															? Math.abs(Number.parseInt(e.target.value))
															: 1,
													})
												}
												min={1}
												className={
													checkInherited('step')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription>
												Quantity increment/decrement step when adding to cart.
											</FieldDescription>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel
												htmlFor="min-qty-allowed"
												className="items-center"
											>
												Min Quantity Allowed
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('minQtyAllowed')}
														onInherit={() => applyInherit('minQtyAllowed')}
														parentValue={parentOption?.minQtyAllowed}
													/>
												)}
											</FieldLabel>
											<Input
												id="min-qty-allowed"
												type="number"
												value={option.minQtyAllowed}
												onChange={e =>
													onChange({
														minQtyAllowed: e.target.value
															? Math.abs(Number.parseInt(e.target.value))
															: 1,
													})
												}
												min={1}
												className={
													checkInherited('minQtyAllowed')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription>
												Minimum quantity a customer can purchase.
											</FieldDescription>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel
												htmlFor="max-qty-allowed"
												className="items-center"
											>
												Max Quantity Allowed
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('maxQtyAllowed')}
														onInherit={() => applyInherit('maxQtyAllowed')}
														parentValue={
															parentOption?.maxQtyAllowed || 'Unlimited'
														}
													/>
												)}
											</FieldLabel>
											<Input
												id="max-qty-allowed"
												type="number"
												value={option.maxQtyAllowed || ''}
												onChange={e =>
													onChange({
														maxQtyAllowed: e.target.value
															? Math.abs(Number.parseInt(e.target.value))
															: null,
													})
												}
												min={0}
												placeholder="Unlimited"
												className={
													checkInherited('maxQtyAllowed')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription>
												Maximum quantity a customer can purchase.
											</FieldDescription>
										</Field>
									</FieldGroup>
								</>
							)}
						</FieldGroup>
					</TabsContent>

					<TabsContent
						tabIndex={-1}
						value="inventory"
						className={`m-0 flex ${
							isVariant ? '' : 'h-[360px]'
						} flex-col gap-3 overflow-y-scroll p-3 pb-12`}
					>
						<CardTitle className="my-1 mb-3">Inventory</CardTitle>

						<FieldGroup>
							<FieldGroup className="sm:flex-row">
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="sku" className="items-center">
										SKU
										{isVariant && (
											<InheritButton
												isInherited={checkInherited('sku')}
												onInherit={() => applyInherit('sku')}
												parentValue={parentOption?.sku}
											/>
										)}
									</FieldLabel>
									<Input
										id="sku"
										value={option.sku || ''}
										onChange={e => onChange({ sku: e.target.value })}
										placeholder="e.g., IPH14PRO128"
										className={
											checkInherited('sku')
												? 'text-muted-foreground border-dashed'
												: ''
										}
									/>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="identifier" className="items-center">
										Identifier (Barcode/EAN)
										{isVariant && (
											<InheritButton
												isInherited={checkInherited('identifier')}
												onInherit={() => applyInherit('identifier')}
												parentValue={parentOption?.identifier}
											/>
										)}
									</FieldLabel>
									<Input
										id="identifier"
										value={option.identifier || ''}
										onChange={e => onChange({ identifier: e.target.value })}
										placeholder="e.g., 190199000001"
										className={
											checkInherited('identifier')
												? 'text-muted-foreground border-dashed'
												: ''
										}
									/>
								</Field>
							</FieldGroup>

							<FieldSeparator />

							<Field orientation={'horizontal'}>
								<FieldContent>
									<FieldLabel htmlFor="manageStock" className="items-center">
										Manage Stock
										{isVariant && (
											<InheritButton
												isInherited={checkInherited('manageStock')}
												onInherit={() => applyInherit('manageStock')}
												parentValue={
													parentOption?.manageStock === 1 ? 'On' : 'Off'
												}
											/>
										)}
									</FieldLabel>
								</FieldContent>
								<Switch
									id="manageStock"
									checked={option.manageStock === 1}
									onCheckedChange={checked =>
										onChange({ manageStock: checked ? 1 : 0 })
									}
								/>
							</Field>

							{option.manageStock === 1 ? (
								<>
									<Field className="text-muted-foreground bg-muted items-center justify-center rounded-md border border-dashed p-3 text-sm">
										Stock quantity management will be available here once
										implemented.
									</Field>
									<FieldGroup className="sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel>Quantity</FieldLabel>
											<Input placeholder="0" disabled />
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel>Low Stock Threshold</FieldLabel>
											<Input placeholder="0" disabled />
										</Field>
									</FieldGroup>
									<Field orientation={'horizontal'}>
										<FieldLabel>Allow Backorder</FieldLabel>
										<Switch disabled />
									</Field>
								</>
							) : (
								<Field>
									<FieldLabel htmlFor="stockStatus" className="items-center">
										Stock Status
										{isVariant && (
											<InheritButton
												isInherited={checkInherited('stockStatus')}
												onInherit={() => applyInherit('stockStatus')}
												parentValue={parentOption?.stockStatus}
											/>
										)}
									</FieldLabel>
									<Select
										value={option.stockStatus}
										onValueChange={(value: StockStatus) =>
											onChange({ stockStatus: value })
										}
									>
										<SelectTrigger
											id="stockStatus"
											className={
												checkInherited('stockStatus')
													? 'text-muted-foreground border-dashed'
													: ''
											}
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{StockStatus.map(status => (
												<SelectItem key={status} value={status}>
													{status === 'inStock'
														? 'In Stock'
														: status === 'outOfStock'
															? 'Out of Stock'
															: 'On Back Order'}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</FieldGroup>
					</TabsContent>

					{/* Shipping Tab */}
					<TabsContent
						tabIndex={-1}
						value="shipping"
						className={`m-0 flex ${
							isVariant ? '' : 'h-[360px]'
						} flex-col gap-3 overflow-y-scroll p-3 pb-12`}
					>
						<CardTitle className="my-1 mb-3">Shipping</CardTitle>

						<FieldGroup>
							<Field orientation={'horizontal'}>
								<FieldContent>
									<FieldLabel htmlFor="virtual" className="items-center">
										Virtual Product
										{isVariant && (
											<InheritButton
												isInherited={checkInherited('virtual')}
												onInherit={() => applyInherit('virtual')}
												parentValue={parentOption?.virtual === 1 ? 'Yes' : 'No'}
											/>
										)}
									</FieldLabel>
								</FieldContent>
								<Switch
									id="virtual"
									checked={option.virtual === 1}
									onCheckedChange={checked =>
										onChange({ virtual: checked ? 1 : 0 })
									}
								/>
							</Field>

							{option.virtual === 0 ? (
								<>
									<FieldSeparator />
									<FieldGroup>
										<Field>
											<FieldLabel htmlFor="weight" className="items-center">
												Weight ({storeConfig.inventory.unitSettings.weight})
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('weight')}
														onInherit={() => applyInherit('weight')}
														parentValue={parentOption?.weight}
													/>
												)}
											</FieldLabel>
											<Input
												id="weight"
												type="number"
												value={option.weight || ''}
												onChange={e =>
													onChange({
														weight: e.target.value
															? Math.abs(Number.parseInt(e.target.value))
															: null,
													})
												}
												placeholder="206"
												className={
													checkInherited('weight')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
										</Field>

										<FieldGroup>
											<FieldLabel className="items-center">
												Dimensions ({storeConfig.inventory.unitSettings.length})
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('dimension')}
														onInherit={() => applyInherit('dimension')}
														parentValue={
															parentOption?.dimension
																? `${parentOption.dimension.length}×${parentOption.dimension.width}×${parentOption.dimension.height}`
																: null
														}
													/>
												)}
											</FieldLabel>
											<Field className="sm:flex-row">
												<Input
													type="number"
													value={option.dimension?.length || ''}
													onChange={e =>
														onChange({
															dimension: {
																length:
																	Math.abs(Number.parseFloat(e.target.value)) ||
																	0,
																width: option.dimension?.width || 0,
																height: option.dimension?.height || 0,
															},
														})
													}
													placeholder="L"
													className={
														checkInherited('dimension')
															? 'text-muted-foreground border-dashed'
															: ''
													}
												/>
												<Input
													type="number"
													value={option.dimension?.width || ''}
													onChange={e =>
														onChange({
															dimension: {
																length: option.dimension?.length || 0,
																width:
																	Math.abs(Number.parseFloat(e.target.value)) ||
																	0,
																height: option.dimension?.height || 0,
															},
														})
													}
													placeholder="W"
													className={
														checkInherited('dimension')
															? 'text-muted-foreground border-dashed'
															: ''
													}
												/>
												<Input
													type="number"
													value={option.dimension?.height || ''}
													onChange={e =>
														onChange({
															dimension: {
																length: option.dimension?.length || 0,
																width: option.dimension?.width || 0,
																height:
																	Math.abs(Number.parseFloat(e.target.value)) ||
																	0,
															},
														})
													}
													placeholder="H"
													className={
														checkInherited('dimension')
															? 'text-muted-foreground border-dashed'
															: ''
													}
												/>
											</Field>
										</FieldGroup>
									</FieldGroup>
									<Field>
										<FieldLabel htmlFor="shippingClass">
											Shipping Class
										</FieldLabel>
										<Select disabled>
											<SelectTrigger id="shippingClass">
												<SelectValue placeholder="Select shipping class (coming soon)" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="placeholder">Placeholder</SelectItem>
											</SelectContent>
										</Select>
										<FieldDescription>
											Shipping classes will be available once shipping methods
											are configured.
										</FieldDescription>
									</Field>
								</>
							) : (
								<Field className="text-muted-foreground bg-muted items-center justify-center rounded-md border border-dashed p-3 text-sm">
									Turn off virtual product to enable shipping details.
								</Field>
							)}
						</FieldGroup>
					</TabsContent>

					{/* Digital Product Tab */}
					<TabsContent
						tabIndex={-1}
						value="digital"
						className={`m-0 flex ${
							isVariant ? '' : 'h-[360px]'
						} flex-col gap-3 overflow-y-scroll p-3 pb-12`}
					>
						<CardTitle className="my-1 mb-3">Digital</CardTitle>

						<FieldGroup>
							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel htmlFor="downloadable" className="items-center">
										Downloadable
										{isVariant && (
											<InheritButton
												isInherited={checkInherited('downloadable')}
												onInherit={() => applyInherit('downloadable')}
												parentValue={
													parentOption?.downloadable === 1 ? 'Yes' : 'No'
												}
											/>
										)}
									</FieldLabel>
								</FieldContent>
								<Switch
									id="downloadable"
									checked={option.downloadable === 1}
									onCheckedChange={checked =>
										onChange({ downloadable: checked ? 1 : 0 })
									}
								/>
							</Field>

							{option.downloadable === 1 ? (
								<>
									<FieldSeparator />
									<FieldLabel>Download Files</FieldLabel>

									{option.downloadFiles && option.downloadFiles.length > 0 ? (
										<FieldGroup>
											{option.downloadFiles.map((file, index) => (
												<Field orientation={'horizontal'} key={index}>
													<Input
														value={file.name}
														onChange={e => {
															const newFiles = [...(option.downloadFiles || [])]
															newFiles[index] = {
																...newFiles[index],
																name: e.target.value,
															}
															onChange({ downloadFiles: newFiles })
														}}
														placeholder="File name"
													/>
													<Input
														value={file.url}
														onChange={e => {
															const newFiles = [...(option.downloadFiles || [])]
															newFiles[index] = {
																...newFiles[index],
																url: e.target.value,
															}
															onChange({ downloadFiles: newFiles })
														}}
														placeholder="File URL"
													/>
													<Button
														type="button"
														size="icon"
														variant="outline"
														className="size-8"
														onClick={() => window.open(file.url, '_blank')}
													>
														<DownloadCloud size={16} />
													</Button>
													<Button
														type="button"
														size="icon"
														variant="destructive"
														className="size-8"
														onClick={() => {
															const newFiles = option.downloadFiles?.filter(
																(_, i) => i !== index,
															)
															onChange({ downloadFiles: newFiles || [] })
														}}
													>
														<X />
													</Button>
												</Field>
											))}
										</FieldGroup>
									) : (
										<Field className="text-muted-foreground bg-muted items-center justify-center rounded-md border border-dashed p-3 text-sm">
											No download files added yet.
										</Field>
									)}

									<Field>
										<Button
											type="button"
											size="sm"
											onClick={() => {
												const newFile: DownloadFile = {
													name: 'New file',
													url: 'https://example.com/file.zip',
												}
												onChange({
													downloadFiles: [
														...(option.downloadFiles || []),
														newFile,
													],
												})
											}}
										>
											<Plus size={14} className="mr-1" />
											Add File
										</Button>
									</Field>

									<FieldSeparator />

									<FieldGroup className="sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel
												htmlFor="downloadLimit"
												className="items-center"
											>
												Download Limit
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('downloadLimit')}
														onInherit={() => applyInherit('downloadLimit')}
														parentValue={
															parentOption?.downloadLimit || 'Unlimited'
														}
													/>
												)}
											</FieldLabel>
											<Input
												id="downloadLimit"
												type="number"
												value={option.downloadLimit || ''}
												onChange={e =>
													onChange({
														downloadLimit: e.target.value
															? Math.abs(Number.parseInt(e.target.value))
															: null,
													})
												}
												placeholder="Unlimited"
												min={0}
												className={
													checkInherited('downloadLimit')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription>
												Number of times a customer can download the file.
											</FieldDescription>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel
												htmlFor="downloadExpiry"
												className="items-center"
											>
												Download Expiry (seconds)
												{isVariant && (
													<InheritButton
														isInherited={checkInherited('downloadExpiry')}
														onInherit={() => applyInherit('downloadExpiry')}
														parentValue={
															parentOption?.downloadExpiry || 'Never'
														}
													/>
												)}
											</FieldLabel>
											<Input
												id="downloadExpiry"
												type="number"
												value={option.downloadExpiry || ''}
												onChange={e =>
													onChange({
														downloadExpiry: e.target.value
															? Math.abs(Number.parseInt(e.target.value))
															: null,
													})
												}
												placeholder="Never expires"
												min={0}
												className={
													checkInherited('downloadExpiry')
														? 'text-muted-foreground border-dashed'
														: ''
												}
											/>
											<FieldDescription>
												Time period after purchase when the download link
												expires.
											</FieldDescription>
										</Field>
									</FieldGroup>
								</>
							) : (
								<Field className="text-muted-foreground bg-muted items-center justify-center rounded-md border border-dashed p-3 text-sm">
									Enable if this product option is a digital downloadable item.
								</Field>
							)}
						</FieldGroup>
					</TabsContent>

					{/* Others Tab */}
					<TabsContent
						tabIndex={-1}
						value="others"
						className={`m-0 flex ${
							isVariant ? '' : 'h-[360px]'
						} flex-col gap-3 overflow-y-scroll p-3 pb-12`}
					>
						<CardTitle className="my-1 mb-3">Others</CardTitle>

						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="note" className="items-center">
									Additional Note
									{isVariant && (
										<InheritButton
											isInherited={checkInherited('note')}
											onInherit={() => applyInherit('note')}
											parentValue={parentOption?.note}
										/>
									)}
								</FieldLabel>
								<Textarea
									id="note"
									value={option.note || ''}
									onChange={e => onChange({ note: e.target.value })}
									placeholder="Add any additional notes about this product option..."
									rows={4}
									className={
										checkInherited('note')
											? 'text-muted-foreground border-dashed'
											: ''
									}
								/>
								<FieldDescription>
									Note for your own reference, not visible to customers.
								</FieldDescription>
							</Field>
						</FieldGroup>
					</TabsContent>
				</div>
			</Tabs>
		</FieldSet>
	)
}
