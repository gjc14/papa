import { ProductAction } from './product-action'
import { ProductAttributes } from './product-attributes'
import { ProductInformation } from './product-information'
import { ProductInstructions } from './product-instructions'

export const ProductContent = () => {
	return (
		<section className="space-y-12">
			<ProductInformation />
			<ProductAction />
			<ProductInstructions />
			<ProductAttributes />
		</section>
	)
}
