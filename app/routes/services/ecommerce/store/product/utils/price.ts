import { useAtomValue } from 'jotai'

import {
	storeConfigAtom,
	type Product,
	type selectedVariantAttributesAtom,
} from '../context'
import {
	getFilteredVariants,
	getHasVariants,
	getSelectedVariant,
} from './variants'

// ========================================
// Price Calculations
// ========================================

/**
 * Format price for display, returns 0 when scale > 100
 */
function formatPrice(price: bigint, scale: number): string {
	if (scale < 0) throw new Error('Scale must be non-negative')
	if (price < 0n) return '-' + formatPrice(-price, scale)

	const str = price.toString()

	if (scale === 0) return str

	if (str.length <= scale) {
		const zeros = '0'.repeat(scale - str.length)
		return `0.${zeros}${str}`
	}

	const intPart = str.slice(0, -scale)
	const decPart = str.slice(-scale)
	return `${intPart}.${decPart}`
}

/**
 * Get the lowest price from a list of variants
 */
const _getLowestPrice = (variants: NonNullable<Product>['variants']) => {
	const prices = variants.map(variant => ({
		price: formatPrice(
			variant.option.salePrice || variant.option.price,
			variant.option.scale,
		),
		currency: variant.option.currency,
		scale: variant.option.scale,
	}))

	if (prices.length === 0) {
		return { price: '0', currency: '', scale: 0 }
	}

	return prices.reduce((min, current) =>
		BigInt(current.price.split('.')[0]) < BigInt(min.price.split('.')[0])
			? current
			: min,
	)
}

/**
 * Display price based on selection state
 * - If exact variant selected: show its price
 * - If partial selection: show lowest price from filtered variants
 * - If no variants: show product price
 */
const _getDisplayPrice = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
}) => {
	const hasVariants = getHasVariants(props.product)

	if (hasVariants) {
		const selectedVariant = getSelectedVariant(props)
		return selectedVariant
			? {
					price: formatPrice(
						selectedVariant.option.salePrice || selectedVariant.option.price,
						selectedVariant.option.scale,
					),
					currency: selectedVariant.option.currency,
					scale: selectedVariant.option.scale,
				}
			: _getLowestPrice(getFilteredVariants(props))
	}
	return {
		price: formatPrice(
			props.product.option.salePrice || props.product.option.price,
			props.product.option.scale,
		),
		currency: props.product.option.currency,
		scale: props.product.option.scale,
	}
}

/**
 * Check if there's a discount on the displayed price
 */
const _getHasDiscount = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
}) => {
	const hasVariants = getHasVariants(props.product)

	if (hasVariants) {
		const selectedVariant = getSelectedVariant(props)
		const selectedOption = selectedVariant?.option || props.product.option
		return (
			selectedOption &&
			!!selectedOption.salePrice &&
			selectedOption.salePrice < selectedOption.price
		)
	}

	return (
		!!props.product.option.salePrice &&
		props.product.option.salePrice < props.product.option.price
	)
}

/**
 * Original price before discount (if applicable)
 */
const _getDisplayOriginalPrice = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
}) => {
	const hasVariants = getHasVariants(props.product)

	if (hasVariants) {
		const selectedVariant = getSelectedVariant(props)
		return selectedVariant
			? {
					price: formatPrice(
						selectedVariant.option.price,
						selectedVariant.option.scale,
					),
					currency: selectedVariant.option.currency,
					scale: selectedVariant.option.scale,
				}
			: undefined
	}
	return props.product.option.price
		? {
				price: formatPrice(
					props.product.option.price,
					props.product.option.scale,
				),
				currency: props.product.option.currency,
				scale: props.product.option.scale,
			}
		: undefined
}

const getPricing = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
}) => {
	return {
		displayPrice: _getDisplayPrice(props),
		hasDiscount: _getHasDiscount(props),
		displayOriginalPrice: _getDisplayOriginalPrice(props),
	}
}

/**
 * Render price with formatting by passing product option
 *
 * @example
 * const PriceComponent = () => {
 * 	const { hasDiscount, formattedPrice, formattedOriginalPrice } =
 * 		renderPrice(product.option)
 *
 * 	return (
 * 		<div className="flex flex-col">
 * 			{formattedPrice}
 * 			{hasDiscount && (
 * 				<span className="text-muted-foreground text-xs line-through">
 * 					{formattedOriginalPrice}
 * 				</span>
 * 			)}
 * 		</div>
 * 	)
 *	}
 */
const renderPrice = (
	option: {
		price: bigint
		salePrice: bigint | null
		currency: string
		scale: number
	},
	locales?: Intl.LocalesArgument,
	options?: Intl.NumberFormatOptions,
) => {
	const { price, salePrice, currency, scale } = option
	const storeConfig = useAtomValue(storeConfigAtom)

	const displayPrice = salePrice || price
	const hasDiscount = !!salePrice && salePrice < price

	const fmt = new Intl.NumberFormat(locales || storeConfig.language, {
		style: 'currency',
		currency: currency,
		// RangeError: maximumFractionDigits value is out of range. Must be between 0 and 100.
		minimumFractionDigits: scale,
		maximumFractionDigits: scale,
		...options,
	})

	return {
		hasDiscount,
		formattedPrice: fmt.format(
			formatPrice(displayPrice, scale) as Intl.StringNumericLiteral,
		),
		formattedOriginalPrice: fmt.format(
			formatPrice(price, scale) as Intl.StringNumericLiteral,
		),
	}
}

export { formatPrice, getPricing, renderPrice }
