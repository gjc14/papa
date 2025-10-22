import type { Product, selectedVariantAttributesAtom } from '../context'

// ========================================
// Variant Selection & Filtering
// ========================================
// 1. No selectedVariantAttributes.length = 0 -> all variants available
// 2. Some selectedVariantAttributes.length > 0 -> filter variants that match all selected
// 3. All attributes selected -> find exact matching variant

/**
 * Filter variants that match currently selected attributes
 * Used for calculating price ranges when no exact variant is selected
 */
const getFilteredVariants = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
}) => {
	// If no attributes are selected, return all variants
	if (Object.keys(props.selectedVariantAttributes).length === 0) {
		return props.product.variants
	}

	// Filter variants that match the selected attributes
	return props.product.variants.filter(variant => {
		const combination = variant.combination
		return Object.entries(props.selectedVariantAttributes).every(
			([key, value]) => combination[key] === value,
		)
	})
}

/**
 * Find the variant that exactly matches all selected attributes
 */
const getSelectedVariant = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
}) => {
	return props.product.variants.find(variant => {
		const combination = variant.combination
		// Only check attributes that have been selected
		return Object.entries(combination).every(
			([key, value]) => props.selectedVariantAttributes[key] === value,
		)
	})
}

const getHasVariants = (product: NonNullable<Product>) =>
	product.variants.length > 0

export { getFilteredVariants, getSelectedVariant, getHasVariants }
