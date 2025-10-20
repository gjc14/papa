import { useState } from 'react'

import { useAtom } from 'jotai'
import { Eye, EyeClosed, EyeOff, ListChecksIcon, Plus } from 'lucide-react'

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
import { Label } from '~/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { ProductAttributeSelectType } from '~/routes/services/ecommerce/lib/db/schema'

import { productAtom } from '../../../../store/product/context'

type AttributeType = NonNullable<
	NonNullable<ReturnType<typeof productAtom.read>>['attributes']
>[number]

export function Attributes() {
	const [product, setProduct] = useAtom(productAtom)

	if (!product) return null

	const handleUpdateAttribute = (updatedAttribute: AttributeType) => {
		const updatedAttributes = product.attributes.map(attr =>
			attr.id === updatedAttribute.id ? updatedAttribute : attr,
		)
		setProduct({ ...product, attributes: updatedAttributes })
	}

	const handleDeleteAttribute = (id: number) => {
		const updatedAttributes = product.attributes.filter(attr => attr.id !== id)
		setProduct({ ...product, attributes: updatedAttributes })
	}

	const handleAddAttribute = () => {
		const newAttribute: AttributeType = {
			id: -Math.random(), // Temporary ID; replace with real ID from backend
			name: 'New Attribute',
			value: 'Value',
			order: product.attributes.length,
			selectType: 'SELECTOR',
			visible: 1,
			attributeId: null,
		}
		setProduct({
			...product,
			attributes: [...product.attributes, newAttribute],
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Attributes (Variant Options)</CardTitle>
				<CardDescription>
					These are the attributes assigned to this product. Attributes can be
					used for filtering and variant options.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[360px] space-y-2 overflow-scroll">
				{product.attributes.length > 0 ? (
					product.attributes.map(a => (
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
							onClick={() => setIsEditing(true)}
						>
							Edit
						</Button>
					</ItemActions>
				</>
			)}
		</Item>
	)
}
