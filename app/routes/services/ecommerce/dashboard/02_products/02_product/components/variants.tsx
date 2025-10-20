import { useState } from 'react'

import { useAtom } from 'jotai'
import { Grid, Plus } from 'lucide-react'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'

import { productAtom } from '../../../../store/product/context'
import { OptionForm } from './option-form'

/**
 * Variants Component
 * Renders the list of product variants with their respective option forms.
 * Shows all combinations in a card preview, with edit capability via dialog and accordion.
 * @link [ProductVariant](../../../../lib/db/product.server.ts)
 */
export function Variants() {
	const [product, setProduct] = useAtom(productAtom)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [expandedAccordions, setExpandedAccordions] = useState<Set<number>>(
		new Set(),
	)

	if (!product) return null

	const handleVariantOptionChange = (
		variantId: number,
		field: Partial<(typeof product.variants)[number]['option']>,
	) => {
		setProduct(prev => {
			if (!prev) return prev
			const updatedVariants = prev.variants.map(v =>
				v.id === variantId ? { ...v, option: { ...v.option, ...field } } : v,
			)
			return { ...prev, variants: updatedVariants }
		})
	}

	const handleEditClick = (variantId: number) => {
		setExpandedAccordions(new Set([variantId]))
		setIsDialogOpen(true)
	}

	const formatCombination = (combination: { [x: string]: string }) => {
		return Object.entries(combination)
			.map(([key, value]) => `${key}: ${value}`)
			.join(', ')
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Product Variants</CardTitle>
					<CardDescription>
						Manage detail of different variants of your product.
					</CardDescription>
				</CardHeader>
				<CardContent className="max-h-[360px] space-y-2 overflow-scroll">
					{product.variants.map(v => (
						<div
							key={v.id}
							className="flex items-center justify-between rounded-md border p-3"
						>
							<div className="flex-1">
								<p className="text-sm font-medium">
									{formatCombination(v.combination)}
								</p>
							</div>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleEditClick(v.id)}
							>
								Edit
							</Button>
						</div>
					))}
				</CardContent>
				<CardFooter className="flex-col gap-2 @md:flex-row">
					<Button
						variant="outline"
						className="flex-1"
						onClick={() => alert('Not implemented')}
					>
						<Plus />
						Add Variant
					</Button>
					<Button className="flex-1" onClick={() => setIsDialogOpen(true)}>
						<Grid />
						Open Manager
					</Button>
				</CardFooter>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="flex max-h-[80vh] w-full flex-col p-0 sm:max-w-3xl">
					<DialogHeader className="flex-shrink-0 px-6 pt-6">
						<DialogTitle>Edit Variants</DialogTitle>
						<DialogDescription>
							Modify the options for each product variant below.
						</DialogDescription>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto px-6 pb-6">
						<Accordion
							type="multiple"
							value={Array.from(expandedAccordions).map(String)}
							onValueChange={values => {
								setExpandedAccordions(new Set(values.map(Number)))
							}}
							className="w-full"
						>
							{product.variants.map(v => (
								<AccordionItem key={v.id} value={String(v.id)}>
									<AccordionTrigger className="cursor-pointer hover:no-underline">
										{formatCombination(v.combination)}
									</AccordionTrigger>
									<AccordionContent>
										<OptionForm
											option={v.option}
											parentOption={product.option}
											onChange={o => handleVariantOptionChange(v.id, o)}
										/>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
