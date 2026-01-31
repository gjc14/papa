import { Button } from '~/components/ui/button'

import { useProductContext } from '../../hooks/use-product-context'

export const ProductAction = () => {
	const { hasVariants, selectedVariant } = useProductContext()

	return (
		<div className="flex flex-col items-center gap-2">
			<Button
				variant={'ghost'}
				disabled={hasVariants ? !selectedVariant : false}
				className="text-background bg-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary-foreground h-12 w-full border border-transparent"
			>
				Buy Now
			</Button>
			<Button
				variant={'ghost'}
				disabled={hasVariants ? !selectedVariant : false}
				className="text-accent-foreground bg-accent hover:border-accent-foreground h-12 w-full border border-transparent"
			>
				Add to Cart
			</Button>
		</div>
	)
}
