import { atom, useAtomValue, useSetAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'

import { productAtom } from '../../../../store/product/context'
import {
	isFieldInherited,
	OptionForm,
	type ProductOptionType,
} from './option-form'

const productNameAtom = atom(get => get(productAtom)?.name || null)
const productOptionAtom = atom(get => get(productAtom)?.option || null)

export function MainOption() {
	const setProduct = useSetAtom(productAtom)
	const productName = useAtomValue(productNameAtom)
	const productOption = useAtomValue(productOptionAtom)

	if (!productName || !productOption) return null

	const handleOptionChange = (optionUpdated: Partial<ProductOptionType>) => {
		setProduct(prev => {
			if (!prev) return prev
			const prevOption = prev.option
			const newOption = { ...prevOption, ...optionUpdated }

			// Update variants that have inherited fields
			const updatedVariants = prev.variants.map(variant => {
				const updatedVariantOption: Partial<ProductOptionType> = {}

				// Check each field in optionUpdated to see if variant inherited it
				for (const key of Object.keys(
					optionUpdated,
				) as (keyof ProductOptionType)[]) {
					if (isFieldInherited(variant.option, prevOption, key)) {
						updatedVariantOption[key] = newOption[key] as any
					}
				}

				// Only update if there are inherited fields to update
				if (Object.keys(updatedVariantOption).length > 0) {
					return {
						...variant,
						option: { ...variant.option, ...updatedVariantOption },
					}
				}

				return variant
			})

			return {
				...prev,
				option: newOption,
				variants: updatedVariants,
			}
		})
	}

	return (
		<Card id="main-option">
			<CardHeader>
				<CardTitle>{productName}</CardTitle>
				<CardDescription>
					Manage product, inventory, logistics details and more.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<OptionForm option={productOption} onChange={handleOptionChange} />
			</CardContent>
		</Card>
	)
}
