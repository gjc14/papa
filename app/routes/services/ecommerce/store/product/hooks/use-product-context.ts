import { useEffect } from 'react'

import { useAtom, useAtomValue } from 'jotai'

import {
	crossSellProductsAtom,
	hoveredAttributeImageAtom,
	isResolvingAtom,
	productAtom,
	productGalleryAtom,
	selectedVariantAttributesAtom,
	storeConfigAtom,
	upsellProductsAtom,
} from '../context'
import {
	getAttributeValueImage,
	getIsAttributeValueAvailable,
	getVariantOptions,
} from '../utils/attributes'
import { getPricing } from '../utils/price'
import { getHasVariants, getSelectedVariant } from '../utils/variants'

/**
 * Hook to get product page context
 */
export const useProductContext = () => {
	const storeConfig = useAtomValue(storeConfigAtom)
	const product = useAtomValue(productAtom)
	const productGallery = useAtomValue(productGalleryAtom)
	const crossSellProducts = useAtomValue(crossSellProductsAtom)
	const upsellProducts = useAtomValue(upsellProductsAtom)
	const isResolving = useAtomValue(isResolvingAtom)

	const [selectedVariantAttributes, setSelectedVariantAttributes] = useAtom(
		selectedVariantAttributesAtom,
	)
	const [hoveredAttributeImage, setHoveredAttributeImage] = useAtom(
		hoveredAttributeImageAtom,
	)

	useEffect(() => {
		return () => {
			setSelectedVariantAttributes({})
			setHoveredAttributeImage(undefined)
		}
	}, [])

	// ========================================
	// Derived Data
	// ========================================
	const pricing = product
		? getPricing({
				product,
				selectedVariantAttributes,
			})
		: null

	const variantOptions = product
		? getVariantOptions(product.attributes, product.variants)
		: null

	const hasVariants = product ? getHasVariants(product) : false

	const selectedVariant = product
		? getSelectedVariant({ product, selectedVariantAttributes })
		: null

	// ========================================
	// Utilities
	// ========================================
	/** Handle attribute selection */
	const handleAttributeSelect = (attributeName: string, value: string) => {
		setSelectedVariantAttributes(prev => {
			const newSelection = { ...prev }
			if (newSelection[attributeName] === value) {
				delete newSelection[attributeName] // Deselect if clicking the same value
			} else {
				newSelection[attributeName] = value
			}
			return newSelection
		})
	}

	/** Check if an attribute value is available to be selected */
	const isAttributeValueAvailable = (
		attributeName: string,
		attributeValue: string,
	) => {
		if (!product) return false
		return getIsAttributeValueAvailable({
			product,
			selectedVariantAttributes,
			attributeName,
			attributeValue,
		})
	}

	/** Check if an attribute value is currently selected */
	const isAttributeValueSelected = (
		attributeName: string,
		attributeValue: string,
	) => {
		if (!product) return false
		return selectedVariantAttributes[attributeName] === attributeValue
	}

	/** Display image of given attribute */
	const displayAttributeImage = (
		attributeName?: string,
		attributeValue?: string,
	) => {
		if (!product || !attributeName || !attributeValue)
			return setHoveredAttributeImage(undefined)
		const image = getAttributeValueImage({
			product,
			selectedVariantAttributes,
			attributeName,
			attributeValue,
		})
		setHoveredAttributeImage(image)
	}

	// ========================================
	// Return Public API
	// ========================================

	return {
		// States
		storeConfig,
		product,
		productGallery,
		crossSellProducts,
		upsellProducts,
		isResolving,

		selectedVariantAttributes,
		hoveredAttributeImage,

		// Derived
		variantOptions,
		hasVariants,
		selectedVariant,
		pricing,

		// Utilities
		handleAttributeSelect,
		isAttributeValueAvailable,
		isAttributeValueSelected,
		displayAttributeImage,
	}
}
