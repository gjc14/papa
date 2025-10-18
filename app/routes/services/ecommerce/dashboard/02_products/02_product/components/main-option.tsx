import { useAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'

import { productAtom } from '../../../../store/product/context'
import { OptionForm, type ProductOptionType } from './option-form'

export function MainOption() {
	const [product, setProduct] = useAtom(productAtom)

	if (!product) return null

	const handleOptionChange = (field: Partial<ProductOptionType>) => {
		setProduct(prev =>
			prev ? { ...prev, option: { ...prev.option, ...field } } : prev,
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{product.name}</CardTitle>
				<CardDescription>Edit product details</CardDescription>
			</CardHeader>
			<CardContent>
				<OptionForm option={product.option} onChange={handleOptionChange} />
			</CardContent>
		</Card>
	)
}
