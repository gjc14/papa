import { atom, useAtomValue, useSetAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

import { productAtom } from '../../../../store/product/context'

const productNameAtom = atom(get => get(productAtom)?.name)
const productSubtitleAtom = atom(get => get(productAtom)?.subtitle)
const productDescriptionAtom = atom(get => get(productAtom)?.description)
const productPurchaseNoteAtom = atom(get => get(productAtom)?.purchaseNote)

export function GeneralInformation() {
	const setProduct = useSetAtom(productAtom)
	const productName = useAtomValue(productNameAtom)
	const productSubtitle = useAtomValue(productSubtitleAtom)
	const productDescription = useAtomValue(productDescriptionAtom)
	const productPurchaseNote = useAtomValue(productPurchaseNoteAtom)

	const handleProductChange = (
		updatedProduct: Partial<typeof productAtom.read>,
	) => {
		setProduct(prev => {
			if (!prev) return prev
			return { ...prev, ...updatedProduct }
		})
	}

	if (!productName) return null

	return (
		<Card id="general-information">
			<CardHeader>
				<CardTitle>General Information</CardTitle>
				<CardDescription>Manage product basics and details.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Field>
					<FieldLabel htmlFor="p-name">Product Name</FieldLabel>
					<Input
						id="p-name"
						name="name"
						placeholder="Taiwan Formosa Oolong Tea"
						value={productName}
						onChange={e => handleProductChange({ name: e.target.value })}
						required
						autoFocus
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor="p-subtitle">Subtitle</FieldLabel>
					<Input
						id="p-subtitle"
						name="subtitle"
						placeholder="A short one-liner about your product"
						value={productSubtitle || ''}
						onChange={e => handleProductChange({ subtitle: e.target.value })}
					/>
					<FieldDescription>
						Optional tagline displayed below product name.
					</FieldDescription>
				</Field>

				<Field>
					<FieldLabel htmlFor="p-description">Description</FieldLabel>
					<Textarea
						id="p-description"
						name="description"
						placeholder="Detailed product description..."
						value={productDescription || ''}
						onChange={e =>
							handleProductChange({
								description: e.target.value,
							})
						}
						rows={5}
					/>
					<FieldDescription>
						Main product description shown on the product page.
					</FieldDescription>
				</Field>

				<Field>
					<FieldLabel htmlFor="p-purchase-note">Purchase Note</FieldLabel>
					<Textarea
						id="p-purchase-note"
						name="purchaseNote"
						placeholder="Special instructions or notes after purchase..."
						value={productPurchaseNote || ''}
						onChange={e =>
							handleProductChange({
								purchaseNote: e.target.value,
							})
						}
						rows={3}
					/>
					<FieldDescription>
						Note displayed to customer after purchasing.
					</FieldDescription>
				</Field>
			</CardContent>
		</Card>
	)
}
