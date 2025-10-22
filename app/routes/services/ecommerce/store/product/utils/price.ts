import type { Product, selectedVariantAttributesAtom } from '../context'
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
const getLowestPrice = (variants: NonNullable<Product>['variants']) => {
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
const getDisplayPrice = (props: {
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
			: getLowestPrice(getFilteredVariants(props))
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
const getHasDiscount = (props: {
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
const getDisplayOriginalPrice = (props: {
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
		displayPrice: getDisplayPrice(props),
		hasDiscount: getHasDiscount(props),
		displayOriginalPrice: getDisplayOriginalPrice(props),
	}
}

export {
	formatPrice,
	getDisplayOriginalPrice,
	getDisplayPrice,
	getHasDiscount,
	getPricing,
}
