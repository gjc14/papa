import { useMemo, useState } from 'react'

import { atom, useAtomValue, useSetAtom } from 'jotai'
import { MoreVertical, Plus, XIcon } from 'lucide-react'
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
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel, FieldSet } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from '~/components/ui/item'

import { productAtom } from '../../../../store/product/context'

const productInstructionsAtom = atom(
	get =>
		get(productAtom)?.instructions.sort((a, b) => a.order - b.order) || null,
)

type InstructionsType = NonNullable<
	NonNullable<ReturnType<typeof productAtom.read>>['instructions']
>[number]

type InstructionWithId = InstructionsType & { _id: string }

export const Instructions = () => {
	const setProduct = useSetAtom(productAtom)
	const productInstructions = useAtomValue(productInstructionsAtom)

	if (!productInstructions) return null

	// useMemo to ensure each instruction has a unique and stable _id
	const instructionsWithIds = useMemo<InstructionWithId[]>(() => {
		return productInstructions.map(d => ({
			...d,
			_id: (d as InstructionWithId)._id || nanoid(),
		}))
	}, [productInstructions])

	const handleUpdateInstruction = (updatedInstruction: InstructionWithId) => {
		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				instructions: instructionsWithIds.map(d =>
					d._id === updatedInstruction._id ? updatedInstruction : d,
				),
			}
		})
	}

	const handleDeleteInstruction = (id: string) => {
		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				instructions: instructionsWithIds.filter(d => d._id !== id),
			}
		})
	}

	return (
		<Card id="instruction">
			<CardHeader>
				<CardTitle>Instructions</CardTitle>
				<CardDescription>
					Every instruction will help your customers make the right choice. e.g.
					How To Use; Ingredients.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[360px] space-y-2 overflow-scroll">
				{instructionsWithIds.length > 0 ? (
					instructionsWithIds
						.sort((a, b) => a.order - b.order)
						.map(i => (
							<InstructionEditDialog
								key={i._id}
								instruction={i}
								onSave={handleUpdateInstruction}
							>
								<Item variant="outline" className="overflow-auto">
									<ItemContent>
										<ItemTitle>{i.title || 'Untitled'}</ItemTitle>
										<ItemDescription>
											{i.content || 'No content'}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<DialogTrigger asChild>
											<Button variant="outline" size="sm">
												Edit
											</Button>
										</DialogTrigger>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													className="size-8"
												>
													<MoreVertical />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => handleDeleteInstruction(i._id)}
													className="focus:bg-destructive/90 focus:text-white"
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</ItemActions>
								</Item>
							</InstructionEditDialog>
						))
				) : (
					<p className="text-muted-foreground rounded-md border border-dashed p-3 text-center text-sm">
						No instructions added yet. Click "Add Instruction" to create one.
					</p>
				)}
			</CardContent>
			<CardFooter>
				<InstructionEditDialog
					instruction={createNewInstruction(instructionsWithIds)}
					onSave={i =>
						setProduct(prev => {
							if (!prev) return prev
							return {
								...prev,
								instructions: [...instructionsWithIds, i],
							}
						})
					}
				>
					<Button variant="outline" size="sm" className="w-full" asChild>
						<DialogTrigger>
							<Plus />
							Add Instruction
						</DialogTrigger>
					</Button>
				</InstructionEditDialog>
			</CardFooter>
		</Card>
	)
}

export function createNewInstruction(instructionsWithIds: InstructionWithId[]) {
	return {
		order: instructionsWithIds.length,
		title: 'New Instruction',
		content: 'Content here',
		_id: nanoid(),
	}
}

export function InstructionEditDialog({
	instruction,
	onSave,
	children,
}: {
	instruction: InstructionWithId
	onSave: (updatedInstruction: InstructionWithId) => void
	children?: React.ReactNode
}) {
	const [open, setOpen] = useState(false)
	const [editedInstruction, setEditedInstruction] = useState(instruction)

	return (
		<Dialog
			open={open}
			onOpenChange={open => {
				open && setEditedInstruction(instruction)
				setOpen(open)
			}}
		>
			{children}
			<DialogContent>
				<FieldSet className="relative w-full">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="title">Title</FieldLabel>
							<Input
								id="title"
								value={editedInstruction.title}
								onChange={e =>
									setEditedInstruction({
										...editedInstruction,
										title: e.target.value,
									})
								}
								placeholder="Title"
								autoFocus
							/>
							<FieldLabel htmlFor="content">Content</FieldLabel>
							<Input
								id="content"
								value={editedInstruction.content || ''}
								onChange={e =>
									setEditedInstruction({
										...editedInstruction,
										content: e.target.value,
									})
								}
								placeholder="Content"
							/>
						</Field>

						<div className="flex flex-col gap-2 md:flex-row-reverse">
							<Button
								size="sm"
								className="w-full md:w-auto md:flex-1"
								onClick={() => {
									onSave(editedInstruction)
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
