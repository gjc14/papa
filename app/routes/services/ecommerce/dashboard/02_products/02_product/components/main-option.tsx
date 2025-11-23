import { atom, useAtomValue, useSetAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'

import { productAtom } from '../../../../store/product/context'
import { OptionForm, type ProductOptionType } from './option-form'

const productNameAtom = atom(get => get(productAtom)?.name || null)
const productOptionAtom = atom(get => get(productAtom)?.option || null)

export function MainOption() {
	const setProduct = useSetAtom(productAtom)
	const productName = useAtomValue(productNameAtom)
	const productOption = useAtomValue(productOptionAtom)

	if (!productName || !productOption) return null

	const handleOptionChange = (field: Partial<ProductOptionType>) => {
		setProduct(prev => {
			if (!prev) return prev
			return { ...prev, option: { ...prev.option, ...field } }
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
