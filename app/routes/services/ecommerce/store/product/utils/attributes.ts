import type { Product, selectedVariantAttributesAtom } from '../context'

/**
 * Get variant attribute keys based on product attributes and variants
 *
 * @example
 * const variantOptions = getVariantOptions(product.attributes, product.variants)
 * console.log(variantOptions) // { color: Set{'black','white'}, size: Set{'S','M','L'} }
 */
const getVariantOptions = (
	attributes: NonNullable<Product>['attributes'],
	variants?: NonNullable<Product>['variants'],
) => {
	const options: Record<string, Set<string>> = {}

	let availableCombinations: Record<string, Set<string>> | undefined = undefined
	if (variants) {
		availableCombinations = variants.reduce(
			(acc, variant) => {
				Object.entries(variant.combination).forEach(([attr, value]) => {
					if (!acc[attr]) {
						acc[attr] = new Set<string>()
					}
					acc[attr].add(value)
				})
				return acc
			},
			{} as Record<string, Set<string>>,
		)
	}

	attributes.forEach(attr => {
		if (attr.selectType !== 'HIDDEN' && attr.name && attr.value) {
			const aName = attr.name
			if (availableCombinations) {
				Object.keys(availableCombinations).includes(aName) &&
					availableCombinations[aName].forEach(value => {
						if (!options[aName]) {
							options[aName] = new Set()
						}
						options[aName].add(value)
					})
			} else {
				options[aName] = new Set(attr.value.split('|').map(v => v.trim()))
			}
		}
	})
	return options
}

// ========================================
// Availability Checks
// ========================================

/**
 * Check if a specific attribute value is available given current selections
 * Used to disable unavailable options in the UI
 */
const getIsAttributeValueAvailable = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
	attributeName: string
	attributeValue: string
}): boolean => {
	const { product, selectedVariantAttributes, attributeName, attributeValue } =
		props

	const testSelection = {
		...selectedVariantAttributes,
		[attributeName]: attributeValue, // Simulate selecting this value
	}
	return product.variants.some(variant => {
		const combination = variant.combination
		return Object.entries(testSelection).every(
			([key, value]) => combination[key] === value,
		)
	})
}

/**
 * Get all variants that would match if a specific attribute value is selected
 */
const getVariantsForAttributeValue = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
	attributeName: string
	attributeValue: string
}) => {
	const { product, selectedVariantAttributes, attributeName, attributeValue } =
		props

	const testSelection = {
		...selectedVariantAttributes,
		[attributeName]: attributeValue, // Simulate selecting this value
	}
	return product.variants.filter(variant => {
		const combination = variant.combination
		return Object.entries(testSelection).every(
			([key, value]) => combination[key] === value,
		)
	})
}

/**
 * Get images for variants matching a specific attribute value
 * Useful for hover previews
 */
const getAttributeValueImage = (props: {
	product: NonNullable<Product>
	selectedVariantAttributes: ReturnType<
		typeof selectedVariantAttributesAtom.read
	>
	attributeName: string
	attributeValue: string
}) => {
	const variants = getVariantsForAttributeValue(props)

	// Find the first variant (after ordering) that has an image and return its image info
	const match = variants
		.sort((a, b) => a.order - b.order)
		.find(variant => !!variant.option.image)

	if (!match || !match.option.image) return undefined

	return {
		image: match.option.image,
		imageAlt: match.option.imageAlt,
		imageTitle: match.option.imageTitle,
	}
}

export {
	getVariantOptions,
	getIsAttributeValueAvailable,
	getVariantsForAttributeValue,
	getAttributeValueImage,
}
