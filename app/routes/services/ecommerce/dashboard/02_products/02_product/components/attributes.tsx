import { useState } from 'react'

import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Eye, EyeOff, ListChecksIcon, MoreVertical, Plus } from 'lucide-react'

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
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
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
	get => get(productAtom)?.attributes.sort((a, b) => a.order - b.order) ?? null,
)
const productVariantsAtom = atom(
	get => get(productAtom)?.variants.sort((a, b) => a.order - b.order) ?? null,
)

type AttributeType = NonNullable<
	ReturnType<typeof productAtom.read>
>['attributes'][number]

type VariantType = NonNullable<
	ReturnType<typeof productAtom.read>
>['variants'][number]

export function Attributes() {
	const attributes = useAtomValue(productAttributesAtom)
	const variants = useAtomValue(productVariantsAtom)
	const setProduct = useSetAtom(productAtom)

	if (!attributes || !variants) return null

	const handleUpdateAttribute = (updatedAttribute: AttributeType) => {
		const { updatedAttributes, updatedVariants } = updateAttribute(
			updatedAttribute,
			attributes,
			variants,
		)

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
							<AttributeEditDialog
								key={a.id}
								attribute={a}
								onSave={handleUpdateAttribute}
							>
								<Item variant="outline" className="relative">
									<ItemContent>
										<ItemTitle>
											{a.visible ? <Eye size={12} /> : <EyeOff size={12} />}
											{a.name ? (
												a.name
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</ItemTitle>
										<ItemDescription>{a.value || '-'}</ItemDescription>
										<ItemDescription>
											<Badge>{a.selectType}</Badge>
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<DialogTrigger
											render={
												<Button variant="outline" size="sm">
													Edit
												</Button>
											}
										/>
										<DropdownMenu>
											<DropdownMenuTrigger
												render={
													<Button variant="outline" size="icon-sm">
														<MoreVertical />
													</Button>
												}
											/>
											<DropdownMenuContent>
												<DropdownMenuGroup>
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onClick={() => handleDeleteAttribute(a.id)}
													>
														Delete
													</DropdownMenuItem>
												</DropdownMenuGroup>
											</DropdownMenuContent>
										</DropdownMenu>
									</ItemActions>
								</Item>
							</AttributeEditDialog>
						))
				) : (
					<p className="text-muted-foreground border border-dashed p-3 text-center text-xs">
						No attributes. Click "Add Attribute" to create one.
					</p>
				)}
			</CardContent>
			<CardFooter className="flex-col gap-2 md:flex-row">
				<AttributeEditDialog
					attribute={createNewAttribute(attributes)}
					onSave={a => {
						setProduct(prev => {
							if (!prev) return prev
							return {
								...prev,
								attributes: [...prev.attributes, a],
							}
						})
					}}
				>
					<Button
						variant="outline"
						size="sm"
						className="w-full md:w-auto md:flex-1"
						render={
							<DialogTrigger>
								<Plus />
								Add Attribute
							</DialogTrigger>
						}
					/>
				</AttributeEditDialog>
				<Button
					variant="outline"
					size="sm"
					className="w-full md:w-auto md:flex-1"
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

export function createNewAttribute(attributes: AttributeType[]): AttributeType {
	return {
		// postgres integer -2147483648 to +2147483647
		id: -(Math.floor(Math.random() * 2147483648) + 1), // id doesn't matter, backend will delete all and recreate
		name: 'Untitled',
		value: 'A | B | C',
		order: attributes.length + 1,
		selectType: 'SELECTOR',
		visible: 1,
		attributeId: null,
	}
}

/**
 * Attributes made up variants, so
 * when attribute name updated,
 * key in "variant combination" matching the old attribute name should update as well
 */
export function updateAttribute(
	updatedAttribute: AttributeType,
	attributes: AttributeType[],
	variants: VariantType[],
): {
	updatedAttributes: AttributeType[]
	updatedVariants: VariantType[]
} {
	if (!updatedAttribute.name)
		return {
			updatedAttributes: attributes,
			updatedVariants: variants,
		}
	const newAttrName = updatedAttribute.name.trim()

	const oldAttr = attributes.find(attr => attr.id === updatedAttribute.id)
	if (!oldAttr)
		return {
			updatedAttributes: attributes,
			updatedVariants: variants,
		}

	const updatedAttributes: AttributeType[] = attributes.map(attr =>
		attr.id === updatedAttribute.id ? updatedAttribute : attr,
	)

	const updatedVariants: VariantType[] = variants
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

	return { updatedAttributes, updatedVariants }
}

export function AttributeEditDialog({
	attribute,
	onSave,
	children,
}: {
	attribute: AttributeType
	onSave: (updatedAttribute: AttributeType) => void
	children?: React.ReactNode
}) {
	const [open, setOpen] = useState(false)
	const [editedAttribute, setEditedAttribute] = useState(attribute)

	return (
		<Dialog
			open={open}
			onOpenChange={open => {
				open && setEditedAttribute(attribute)
				setOpen(open)
			}}
		>
			{children}
			<DialogContent>
				<FieldSet className="relative w-full">
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
							<FieldDescription>
								Separate multiple values with a pipe (|). Example: A | B | C
							</FieldDescription>
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

						<div className="flex flex-col gap-2 md:flex-row-reverse">
							<Button
								size="sm"
								className="w-full md:w-auto md:flex-1"
								onClick={() => {
									onSave({
										...editedAttribute,
										value:
											editedAttribute.value
												?.split('|')
												.map(v => v.trim())
												.join(' | ') || '',
									})
									setOpen(false)
								}}
							>
								Save
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="w-full md:w-auto md:flex-1"
								onClick={() => {
									setOpen(false)
								}}
							>
								Cancel
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</DialogContent>
		</Dialog>
	)
}
