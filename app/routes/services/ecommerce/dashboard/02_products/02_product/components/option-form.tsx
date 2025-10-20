import { useAtomValue } from 'jotai'
import {
	DownloadCloud,
	DownloadIcon,
	InfoIcon,
	PackageIcon,
	Plus,
	SettingsIcon,
	TruckIcon,
	X,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import { CardTitle } from '~/components/ui/card'
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
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import { SeparatorWithText } from '~/components/separator-with-text'
import {
	StockStatus,
	type DownloadFile,
} from '~/routes/services/ecommerce/lib/db/schema/product'
import { formatPrice } from '~/routes/services/ecommerce/store/product/utils/price'

import { productAtom, storeConfigAtom } from '../../../../store/product/context'

export type ProductOptionType = NonNullable<
	ReturnType<typeof productAtom.read>
>['option']

interface OptionFormProps {
	option: ProductOptionType
	onChange: (field: Partial<ProductOptionType>) => void
	/** Pass in parent option if this is a variant */
	parentOption?: ProductOptionType
}

export function OptionForm({
	option,
	onChange,
	parentOption,
}: OptionFormProps) {
	const storeConfig = useAtomValue(storeConfigAtom)

	const isVariant = !!parentOption

	const tabConfig = [
		{ value: 'general', icon: SettingsIcon, label: 'General' },
		{ value: 'inventory', icon: PackageIcon, label: 'Inventory' },
		{ value: 'shipping', icon: TruckIcon, label: 'Shipping' },
		{ value: 'digital', icon: DownloadIcon, label: 'Digital' },
		{ value: 'others', icon: InfoIcon, label: 'Others' },
	] as const

	const fmt = new Intl.NumberFormat(storeConfig.language, {
		style: 'currency',
		currency: option.currency,
		// RangeError: maximumFractionDigits value is out of range. Must be between 0 and 100.
		minimumFractionDigits: option.scale,
		maximumFractionDigits: option.scale,
	})

	return (
		<FieldSet>
			<Tabs
				defaultValue={tabConfig[0].value}
				orientation="vertical"
				className="flex w-full flex-row gap-1"
			>
				<TabsList asChild>
					<Field
						orientation={'vertical'}
						className="h-auto w-fit justify-start gap-2"
					>
						{tabConfig.map(({ value, icon: Icon, label }) => (
							<TooltipProvider delayDuration={0} key={value}>
								<Tooltip>
									<TooltipTrigger asChild>
										<span>
											<TabsTrigger
												value={value}
												className="h-9 w-9 cursor-pointer p-2"
											>
												<Icon size={16} />
											</TabsTrigger>
										</span>
									</TooltipTrigger>
									<TooltipContent side="right" className="px-2 py-1 text-xs">
										{label}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						))}
					</Field>
				</TabsList>

				<div className="flex grow flex-col overflow-hidden rounded-md border">
					<TabsContent
						value="general"
						className="m-0 flex h-[360px] flex-col gap-3 overflow-y-scroll p-3 pb-12"
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

							<FieldGroup className="@sm:flex-row">
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="price">Regular Price</FieldLabel>
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
									/>
									<FieldDescription className="break-words">
										Display:{' '}
										{fmt.format(
											formatPrice(
												option.price,
												option.scale,
											) as Intl.StringNumericLiteral,
										)}
									</FieldDescription>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="sale-price">Sale Price</FieldLabel>
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
									/>
									<FieldDescription className="break-words">
										Display:{' '}
										{option.salePrice
											? fmt.format(
													formatPrice(
														option.salePrice,
														option.scale,
													) as Intl.StringNumericLiteral,
												)
											: '-'}
									</FieldDescription>
								</Field>
							</FieldGroup>

							<FieldGroup className="@sm:flex-row">
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="sale-starts-at">
										Sale Starts At
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
									/>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="sale-ends-at">Sale Ends At</FieldLabel>
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
									/>
								</Field>
							</FieldGroup>

							<SeparatorWithText text="Number Formatting" />

							<FieldGroup className="@sm:flex-row">
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="scale">Scale</FieldLabel>
									<Input
										id="scale"
										type="number"
										value={option.scale}
										onChange={e => {
											if (Number.isNaN(e.target.value)) return
											if (Number(e.target.value) > 100) return

											onChange({
												scale: Math.abs(Number.parseInt(e.target.value)) || 0,
											})
										}}
										min={0}
										placeholder="2"
									/>
									<FieldDescription>
										Number of decimal places for prices.
									</FieldDescription>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="currency">Currency</FieldLabel>
									<Select
										value={option.currency}
										onValueChange={value => onChange({ currency: value })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Choose currency" />
										</SelectTrigger>
										<SelectContent>
											{Intl.supportedValuesOf('currency').map(currencyCode => (
												<SelectItem key={currencyCode} value={currencyCode}>
													{currencyCode}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</FieldGroup>

							<SeparatorWithText text="Quantity Limits" />

							<FieldGroup className="@sm:flex-row">
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="in-batch">In Batch Quantity</FieldLabel>
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
									/>
									<FieldDescription>
										Quantity increment/decrement step when adding to cart.
									</FieldDescription>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="min-qty-allowed">
										Min Quantity Allowed
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
									/>
									<FieldDescription>
										Minimum quantity a customer can purchase.
									</FieldDescription>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="max-qty-allowed">
										Max Quantity Allowed
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
									/>
									<FieldDescription>
										Maximum quantity a customer can purchase.
									</FieldDescription>
								</Field>
							</FieldGroup>
						</FieldGroup>
					</TabsContent>

					<TabsContent
						value="inventory"
						className="m-0 flex h-[360px] flex-col gap-3 overflow-y-scroll p-3 pb-12"
					>
						<CardTitle className="my-1 mb-3">Inventory</CardTitle>

						<FieldGroup>
							<FieldLabel>Product Identification</FieldLabel>
							<FieldGroup className="@sm:flex-row">
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="sku">SKU</FieldLabel>
									<Input
										id="sku"
										value={option.sku || ''}
										onChange={e => onChange({ sku: e.target.value })}
										placeholder="e.g., IPH14PRO128"
									/>
								</Field>
								<Field className="min-w-0 flex-1">
									<FieldLabel htmlFor="identifier">
										Identifier (Barcode/EAN)
									</FieldLabel>
									<Input
										id="identifier"
										value={option.identifier || ''}
										onChange={e => onChange({ identifier: e.target.value })}
										placeholder="e.g., 190199000001"
									/>
								</Field>
							</FieldGroup>

							<FieldSeparator />

							<Field orientation={'horizontal'}>
								<FieldLabel htmlFor="manageStock">Manage Stock</FieldLabel>
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
									<FieldGroup className="@sm:flex-row">
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
									<FieldLabel htmlFor="stockStatus">Stock Status</FieldLabel>
									<Select
										value={option.stockStatus}
										onValueChange={(value: StockStatus) =>
											onChange({ stockStatus: value })
										}
									>
										<SelectTrigger id="stockStatus">
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
						value="shipping"
						className="m-0 flex h-[360px] flex-col gap-3 overflow-y-scroll p-3 pb-12"
					>
						<CardTitle className="my-1 mb-3">Shipping</CardTitle>

						<FieldGroup>
							<Field orientation={'horizontal'}>
								<FieldLabel htmlFor="virtual">Virtual Product</FieldLabel>
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
											<FieldLabel htmlFor="weight">
												Weight ({storeConfig.inventory.unitSettings.weight})
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
											/>
										</Field>

										<FieldGroup>
											<FieldLabel>
												Dimensions ({storeConfig.inventory.unitSettings.length})
											</FieldLabel>
											<Field className="@sm:flex-row">
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
									Enable physical product shipping by turning off the virtual
									product option to set shipping details.
								</Field>
							)}
						</FieldGroup>
					</TabsContent>

					{/* Digital Product Tab */}
					<TabsContent
						value="digital"
						className="m-0 flex h-[360px] flex-col gap-3 overflow-y-scroll p-3 pb-12"
					>
						<CardTitle className="my-1 mb-3">Digital</CardTitle>

						<FieldGroup>
							<Field orientation="horizontal">
								<FieldLabel htmlFor="downloadable">Downloadable</FieldLabel>
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

									<FieldGroup className="@sm:flex-row">
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="downloadLimit">
												Download Limit
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
											/>
											<FieldDescription>
												Number of times a customer can download the file.
											</FieldDescription>
										</Field>
										<Field className="min-w-0 flex-1">
											<FieldLabel htmlFor="downloadExpiry">
												Download Expiry (seconds)
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
						value="others"
						className="m-0 flex h-[360px] flex-col gap-3 overflow-y-scroll p-3 pb-12"
					>
						<CardTitle className="my-1 mb-3">Others</CardTitle>

						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="note">Additional Note</FieldLabel>
								<Textarea
									id="note"
									value={option.note || ''}
									onChange={e => onChange({ note: e.target.value })}
									placeholder="Add any additional notes about this product option..."
									rows={4}
								/>
								<FieldDescription>
									Note for your reference, not visible to customers.
								</FieldDescription>
							</Field>
						</FieldGroup>
					</TabsContent>
				</div>
			</Tabs>
		</FieldSet>
	)
}
