import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

import { useProductContext } from '../../hooks/use-product-context'

export const ProductInstructions = () => {
	const [activeTab, setActiveTab] = useState(0)
	const { product } = useProductContext()

	if (!product || !product.instructions || product.instructions.length === 0)
		return null

	return (
		<div>
			<Separator />
			<div className="mt-8 mb-6 flex w-full gap-6 overflow-scroll border-b">
				{product.instructions.map((detail, idx) => (
					<Button
						key={idx}
						onClick={() => setActiveTab(idx)}
						className={`cursor-pointer border-b-2 px-0 pb-5 text-sm font-medium transition-colors hover:no-underline ${
							activeTab === idx
								? 'border-primary'
								: 'text-foreground/70 hover:text-foreground border-transparent'
						}`}
						variant={'link'}
					>
						{detail.title}
					</Button>
				))}
			</div>
			<div className="prose prose-sm max-w-none">
				<p className="text-foreground/90 leading-relaxed whitespace-pre-line">
					{product.instructions[activeTab].content}
				</p>
			</div>
		</div>
	)
}
