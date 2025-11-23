import { useState } from 'react'

import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Eye, EyeOff, ListChecksIcon, Plus } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from '~/components/ui/item'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { ProductAttributeSelectType } from '~/routes/services/ecommerce/lib/db/schema'

import { productAtom } from '../../../../store/product/context'

const productAttributesAtom = atom(
	get => get(productAtom)?.attributes.sort((a, b) => a.order - b.order) || null,
)
const productVariantsAtom = atom(
	get => get(productAtom)?.variants.sort((a, b) => a.order - b.order) || null,
)

type AttributeType = NonNullable<
	NonNullable<ReturnType<typeof productAtom.read>>['attributes']
>[number]

export function Attributes() {
	const attributes = useAtomValue(productAttributesAtom)
	const variants = useAtomValue(productVariantsAtom)
	const setProduct = useSetAtom(productAtom)

	if (!attributes) return null

	/**
	 * Attributes made up variants, so
	 * when attribute name updated,
	 * key in "variant combination" matching the old attribute name should update as well
	 */
	const handleUpdateAttribute = (updatedAttribute: AttributeType) => {
		if (!updatedAttribute.name) return
		const newAttrName = updatedAttribute.name.trim()

		const oldAttr = attributes.find(attr => attr.id === updatedAttribute.id)
		if (!oldAttr) return

		const updatedAttributes = attributes.map(attr =>
			attr.id === updatedAttribute.id ? updatedAttribute : attr,
		)

		const updatedVariants = variants
			? variants.map(variant => {
					if (!oldAttr.name || newAttrName === oldAttr.name) return variant

					// Update key in combination
					const newCombination = { ...variant.combination }
					if (newCombination.hasOwnProperty(oldAttr.name)) {
						newCombination[newAttrName] = newCombination[oldAttr.name]
						delete newCombination[oldAttr.name]
					}
					return { ...variant, combination: newCombination }
				})
			: []

		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				attributes: updatedAttributes,
				variants: updatedVariants,
			}
		})
	}

	/**
	 * Attributes made up variants, so
	 * when attribute deleted, key in "variant combination" matching the attribute name should also be removed
	 */
	const handleDeleteAttribute = (id: number) => {
		const targetAttribute = attributes.find(attr => attr.id === id)
		if (!targetAttribute) return

		const updatedAttributes = attributes.filter(attr => attr.id !== id)

		const updatedVariants = variants
			? variants.map(variant => {
					if (!targetAttribute.name) return variant
					const newCombination = { ...variant.combination }
					delete newCombination[targetAttribute.name]
					return { ...variant, combination: newCombination }
				})
			: []

		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				attributes: updatedAttributes,
				variants: updatedVariants,
			}
		})
	}

	const handleAddAttribute = () => {
		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				attributes: [
					...attributes,
					{
						// postgres integer -2147483648 to +2147483647
						id: -(Math.floor(Math.random() * 2147483648) + 1), // id doesn't matter, backend will delete all and recreate
						name: '',
						value: 'A | B | C',
						order: attributes.length + 1,
						selectType: 'SELECTOR',
						visible: 1,
						attributeId: null,
					},
				],
			}
		})
	}

	return (
		<Card id="attributes">
			<CardHeader>
				<CardTitle>Attributes (Variant Options)</CardTitle>
				<CardDescription>
					These are the attributes assigned to this product. Attributes can be
					used for filtering and variant options.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[360px] space-y-2 overflow-scroll">
				{attributes.length > 0 ? (
					attributes
						.sort((a, b) => a.order - b.order)
						.map(a => (
							<AttributeItem
								key={a.id}
								attribute={a}
								onUpdate={handleUpdateAttribute}
								onDelete={handleDeleteAttribute}
							/>
						))
				) : (
					<p className="text-muted-foreground rounded-md border border-dashed p-3 text-center text-sm">
						No attributes. Click "Add Attribute" to create one.
					</p>
				)}
			</CardContent>
			<CardFooter className="flex-col gap-2 @md:flex-row">
				<Button
					variant="outline"
					size="sm"
					className="flex-1"
					onClick={handleAddAttribute}
				>
					<Plus />
					Add Attribute
				</Button>
				<Button
					size="sm"
					className="flex-1"
					onClick={() => alert('not implemented')}
				>
					<ListChecksIcon />
					{/* 1. Post 2. Get ID 3. Update productAtom */}
					Select from Existing
				</Button>
			</CardFooter>
		</Card>
	)
}

function AttributeItem({
	attribute,
	onUpdate,
	onDelete,
}: {
	attribute: AttributeType
	onUpdate: (updatedAttribute: AttributeType) => void
	onDelete: (id: number) => void
}) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedAttribute, setEditedAttribute] = useState(attribute)

	return (
		<Item variant="outline">
			{isEditing ? (
				<FieldSet className="w-full">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								id="name"
								value={editedAttribute.name || ''}
								onChange={e =>
									setEditedAttribute({
										...editedAttribute,
										name: e.target.value,
									})
								}
								placeholder="Name"
								autoFocus
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="value">Value</FieldLabel>
							<Input
								id="value"
								value={editedAttribute.value || ''}
								onChange={e =>
									setEditedAttribute({
										...editedAttribute,
										value: e.target.value,
									})
								}
								placeholder="Value"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="selectType">Select Type</FieldLabel>
							<FieldDescription>
								How user select this attribute. Select HIDDEN if only display on
								specs.
							</FieldDescription>
							<Select
								value={editedAttribute.selectType}
								onValueChange={value =>
									setEditedAttribute({
										...editedAttribute,
										selectType: value as AttributeType['selectType'],
									})
								}
							>
								<SelectTrigger id="selectType" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ProductAttributeSelectType.map(type => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field orientation="horizontal">
							<Checkbox
								id="visible"
								checked={!!editedAttribute.visible}
								onCheckedChange={checked =>
									setEditedAttribute({
										...editedAttribute,
										visible: checked ? 1 : 0,
									})
								}
							/>
							<FieldContent>
								<FieldLabel htmlFor="visible">Visible</FieldLabel>
								<FieldDescription>
									Display this attribute as specification
								</FieldDescription>
							</FieldContent>
						</Field>

						<div className="mt-2 flex gap-2">
							<Button
								size="sm"
								onClick={() => {
									onUpdate(editedAttribute)
									setIsEditing(false)
								}}
							>
								Save
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setEditedAttribute(attribute) // Reset to original
									setIsEditing(false)
								}}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => onDelete(attribute.id)}
								className="ml-auto"
							>
								Delete
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			) : (
				<>
					<ItemContent>
						<ItemTitle>
							{attribute.visible ? <Eye size={16} /> : <EyeOff size={16} />}
							{attribute.name || 'Untitled'}
						</ItemTitle>
						<ItemDescription>{attribute.value || 'No content'}</ItemDescription>
						<ItemDescription>
							<Badge className="rounded-none">{attribute.selectType}</Badge>
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setEditedAttribute(attribute) // Reset to original;
								setIsEditing(true)
							}}
						>
							Edit
						</Button>
					</ItemActions>
				</>
			)}
		</Item>
	)
}
