import { Button } from '~/components/ui/button'

import { useProductContext } from '../../hooks/use-product-context'
import {
	getAttributeKeys,
	getAttributeValueImage,
	getAttributeValues,
	getIsAttributeValueAvailable,
} from '../../utils/attributes'
import { getPricing } from '../../utils/price'
import { getHasVariants, getSelectedVariant } from '../../utils/variants'

export const ProductInformation = () => {
	const {
		storeConfig,
		product,
		selectedAttributes,
		setSelectedAttributes,
		setHoveredAttributeImage,
	} = useProductContext()

	if (!product) return null

	const hasVariants = getHasVariants(product)

	const attributeKeys = getAttributeKeys(product)
	const attributeValues = getAttributeValues(product)

	const selectedVariant = getSelectedVariant({ product, selectedAttributes })

	const selectedOption = selectedVariant?.option || product.option

	const { displayOriginalPrice, displayPrice, hasDiscount } = getPricing({
		product,
		selectedAttributes,
	})

	const handleAttributeSelect = (attributeName: string, value: string) => {
		setSelectedAttributes(prev => {
			const newSelection = { ...prev }
			if (newSelection[attributeName] === value) {
				delete newSelection[attributeName] // Deselect if clicking the same value
			} else {
				newSelection[attributeName] = value
			}
			return newSelection
		})
	}

	const fmt = new Intl.NumberFormat(storeConfig.language, {
		style: 'currency',
		currency: displayPrice.currency,
		minimumFractionDigits: selectedOption.scale,
		maximumFractionDigits: selectedOption.scale,
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

			{hasVariants && attributeKeys.length > 0 && (
				<>
					{/* Attribute Selection */}
					<div className="space-y-6">
						{attributeKeys.map(attrName => (
							<div key={attrName} className="space-y-3">
								<h3 className="text-sm font-medium tracking-wide uppercase">
									{attrName}
								</h3>
								<div className="flex flex-wrap gap-2">
									{attributeValues[attrName].map(attrValue => {
										const isAvailable = getIsAttributeValueAvailable({
											product,
											selectedAttributes,
											attributeName: attrName,
											attributeValue: attrValue,
										})
										const isSelected =
											selectedAttributes[attrName] === attrValue

										return (
											<Button
												key={attrValue}
												onClick={() =>
													handleAttributeSelect(attrName, attrValue)
												}
												onMouseEnter={() => {
													const image = getAttributeValueImage({
														product,
														selectedAttributes,
														attributeName: attrName,
														attributeValue: attrValue,
													})
													setHoveredAttributeImage(image)
												}}
												onMouseLeave={() => setHoveredAttributeImage(undefined)}
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
												{attrValue}
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
						<h3 className="text-sm font-medium">Selected Option</h3>
						{selectedVariant ? (
							<>
								<div className="text-muted-foreground text-xs">
									SKU: {selectedOption.sku || 'N/A'}
								</div>
								<p className="text-muted-foreground text-sm">
									{attributeKeys.map(
										(k, index) =>
											k && (
												<span key={k}>
													{k}:{' '}
													<span className="text-primary font-medium">
														{selectedAttributes[k]}
													</span>
													{index < Object.entries(attributeKeys).length - 1 &&
														', '}
												</span>
											),
									)}
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
