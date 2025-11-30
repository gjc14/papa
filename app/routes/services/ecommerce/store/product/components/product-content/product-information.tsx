import { Button } from '~/components/ui/button'

import { useProductContext } from '../../hooks/use-product-context'

export const ProductInformation = () => {
	const {
		storeConfig,
		product,

		// Derived
		pricing,
		variantOptions,
		hasVariants,
		selectedVariant,

		// Utilities
		handleAttributeSelect,
		isAttributeValueAvailable,
		isAttributeValueSelected,
		displayAttributeImage,
	} = useProductContext()

	if (!product || !pricing || !variantOptions) return null

	const { displayPrice, displayOriginalPrice, hasDiscount } = pricing

	const variantOptionsEntries = Object.entries(variantOptions)

	const selectedVariantOption = selectedVariant?.option || product.option

	const fmt = new Intl.NumberFormat(storeConfig.language, {
		style: 'currency',
		currency: displayPrice.currency,
		minimumFractionDigits: selectedVariantOption.scale,
		maximumFractionDigits: selectedVariantOption.scale,
	})

	return (
		<>
			{/* Basic Info */}
			<div className="space-y-4">
				<div>
					<h1 className="mb-2 text-4xl font-light">{product.name}</h1>
					{product.subtitle && (
						<p className="text-primary/60 text-lg">{product.subtitle}</p>
					)}
				</div>
				<div className="my-8 flex items-baseline gap-3">
					<span className="text-3xl font-light">
						{hasVariants && !selectedVariant && 'From '}
						{fmt.format(displayPrice.price as Intl.StringNumericLiteral)}
					</span>
					{hasDiscount && displayOriginalPrice && (
						<span className="text-muted-foreground text-xl line-through">
							{fmt.format(
								displayOriginalPrice.price as Intl.StringNumericLiteral,
							)}
						</span>
					)}
				</div>
				{product.description && (
					<p className="text-primary/90 leading-relaxed">
						{product.description}
					</p>
				)}
			</div>

			{hasVariants && variantOptionsEntries.length > 0 && (
				<>
					{/* Variant Selection (spread attribute options) */}
					<div className="space-y-6">
						{variantOptionsEntries.map(([name, valueSet]) => (
							<div key={name} className="space-y-3">
								<h3 className="text-sm font-medium tracking-wide uppercase">
									{name}
								</h3>
								<div className="flex flex-wrap gap-2">
									{Array.from(valueSet).map(value => {
										const isAvailable = isAttributeValueAvailable(name, value)
										const isSelected = isAttributeValueSelected(name, value)

										return (
											<Button
												key={value}
												onClick={() => handleAttributeSelect(name, value)}
												onMouseEnter={() => displayAttributeImage(name, value)}
												onMouseLeave={() => displayAttributeImage(undefined)}
												disabled={!isAvailable}
												variant={'ghost'}
												className={`rounded-none border-2 text-sm transition-colors ${
													isSelected
														? 'border-primary bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary dark:hover:bg-primary'
														: isAvailable
															? 'hover:border-muted-foreground cursor-pointer'
															: 'text-muted-foreground/30 cursor-not-allowed line-through'
												}`}
											>
												{value}
											</Button>
										)
									})}
								</div>
							</div>
						))}
					</div>

					{/* Selected Option Display */}
					<div
						className={`space-y-2 rounded-md border-2 ${selectedVariant ? '' : 'border-dashed'} p-4`}
					>
						<h3 className="text-sm font-medium">Selected Variant</h3>
						{selectedVariant ? (
							<>
								<div className="text-muted-foreground text-xs">
									SKU: {selectedVariantOption.sku || 'N/A'}
								</div>
								<p className="text-muted-foreground text-sm">
									{variantOptionsEntries.map(([attrName], index) => {
										// Render in order of attributeName keys
										const value = selectedVariant.combination[attrName]
										return (
											<span key={attrName}>
												{attrName}:{' '}
												<span className="text-primary font-medium">
													{value}
												</span>
												{index < variantOptionsEntries.length - 1 && ' ⨉ '}
											</span>
										)
									})}
								</p>
							</>
						) : (
							<p className="text-primary/90 text-sm">
								Please select an option to see the details.
							</p>
						)}
					</div>
				</>
			)}
		</>
	)
}
