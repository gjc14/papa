import { useMemo, useState } from 'react'

import { useAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from '~/components/ui/item'

import { productAtom } from '../../../../store/product/context'

type InstructionsType = NonNullable<
	NonNullable<ReturnType<typeof productAtom.read>>['instructions']
>[number]

type InstructionWithId = InstructionsType & { _id: string }

export const Instructions = () => {
	const [product, setProduct] = useAtom(productAtom)

	// useMemo to ensure each instruction has a unique and stable _id
	const instructionsWithIds = useMemo<InstructionWithId[]>(() => {
		if (!product || !product.instructions) return []
		return product.instructions.map(d => ({
			...d,
			_id: (d as InstructionWithId)._id || nanoid(),
		}))
	}, [product?.instructions])

	const handleAddInstruction = () => {
		if (!product) return
		const newInstruction: InstructionWithId = {
			order: instructionsWithIds.length,
			title: 'New Instruction',
			content: 'Content here',
			_id: nanoid(),
		}
		setProduct({
			...product,
			instructions: [...instructionsWithIds, newInstruction],
		})
	}

	const handleUpdateInstruction = (updatedInstruction: InstructionWithId) => {
		if (!product) return
		setProduct({
			...product,
			instructions: instructionsWithIds.map(d =>
				d._id === updatedInstruction._id ? updatedInstruction : d,
			),
		})
	}

	const handleDeleteInstruction = (id: string) => {
		if (!product) return
		setProduct({
			...product,
			instructions: instructionsWithIds.filter(d => d._id !== id),
		})
	}

	if (!product) return null

	return (
		<Card>
			<CardHeader>
				<CardTitle>Instructions</CardTitle>
				<CardDescription>
					Every instruction will help your customers make the right choice. e.g.
					How To Use; Ingredients.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[360px] space-y-2 overflow-scroll">
				{instructionsWithIds.length > 0 ? (
					instructionsWithIds.map(instruction => (
						<InstructionItem
							key={instruction._id}
							instruction={instruction}
							onUpdate={handleUpdateInstruction}
							onDelete={handleDeleteInstruction}
						/>
					))
				) : (
					<p className="text-muted-foreground rounded-md border border-dashed p-3 text-center text-sm">
						No instructions added yet. Click "Add Instruction" to create one.
					</p>
				)}
			</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={handleAddInstruction}
				>
					<Plus />
					Add Instruction
				</Button>
			</CardFooter>
		</Card>
	)
}

function InstructionItem({
	instruction,
	onUpdate,
	onDelete,
}: {
	instruction: InstructionWithId
	onUpdate: (updatedInstruction: InstructionWithId) => void
	onDelete: (id: string) => void
}) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedInstruction, setEditedInstruction] = useState(instruction)

	return (
		<Item variant="outline">
			{isEditing ? (
				<ItemContent>
					<Input
						value={editedInstruction.title}
						onChange={e =>
							setEditedInstruction({
								...editedInstruction,
								title: e.target.value,
							})
						}
						placeholder="Title"
					/>
					<Input
						value={editedInstruction.content || ''}
						onChange={e =>
							setEditedInstruction({
								...editedInstruction,
								content: e.target.value,
							})
						}
						placeholder="Content"
					/>
					<div className="mt-2 flex gap-2">
						<Button
							size="sm"
							onClick={() => {
								onUpdate(editedInstruction)
								setIsEditing(false)
							}}
						>
							Save
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setEditedInstruction(instruction) // Reset to original
								setIsEditing(false)
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onDelete(instruction._id)}
							className="ml-auto"
						>
							Delete
						</Button>
					</div>
				</ItemContent>
			) : (
				<>
					<ItemContent>
						<ItemTitle>{instruction.title || 'Untitled'}</ItemTitle>
						<ItemDescription>
							{instruction.content || 'No content'}
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
