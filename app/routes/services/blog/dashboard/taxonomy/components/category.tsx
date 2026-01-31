import { useState } from 'react'
import { Form, useFetcher, useSubmit } from 'react-router'

import { CircleX, PlusCircle } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useFetcherNotification } from '~/hooks/use-notification'
import { cn } from '~/lib/utils'
import { generateSlug } from '~/lib/utils/seo'

import { actionRoute } from '..'
import type { CategoryType } from '../type'

// Category Component
const CategoryComponent = ({
	cat,
	selectedCategoryId,
	onClick,
}: {
	cat: CategoryType & { _isPending?: true }
	selectedCategoryId: number | null
	onClick: () => void
}) => {
	const fetcher = useFetcher()
	const { mutating } = useFetcherNotification(fetcher)

	return (
		<div
			className={cn(
				`bg-muted flex items-center justify-between rounded-md p-3 transition-colors`,
				mutating ? 'opacity-50' : '',
				cat._isPending ? 'cursor-not-allowed' : 'cursor-pointer',
				selectedCategoryId === cat.id
					? 'bg-primary text-primary-foreground'
					: 'bg-muted hover:bg-muted/80',
			)}
			onClick={onClick}
		>
			<div className="font-medium">
				{cat.name}
				<p className="text-muted-foreground text-sm">
					{cat.children?.length || 0} children
				</p>
			</div>
			<CircleX
				className={
					'h-5 w-5' +
					(mutating || cat._isPending
						? ' cursor-not-allowed opacity-50'
						: ' hover:text-destructive cursor-pointer')
				}
				onClick={e => {
					e.stopPropagation()

					if (mutating || cat._isPending) return

					fetcher.submit(
						{ id: cat.id, intent: 'category' },
						{
							method: 'DELETE',
							action: actionRoute,
						},
					)
				}}
			/>
		</div>
	)
}

// ChildCategory Component
const ChildCategoryComponent = ({
	category,
}: {
	category: CategoryType['children'][number] & {
		_isPending?: true
	}
}) => {
	const fetcher = useFetcher()
	const { mutating } = useFetcherNotification(fetcher)

	return (
		<div
			className={cn(
				`bg-muted flex items-center justify-between rounded-md p-3 transition-colors`,
				mutating ? 'opacity-50' : '',
				category._isPending ? 'cursor-not-allowed' : 'cursor-pointer',
			)}
		>
			<div className="font-medium">{category.name}</div>
			<CircleX
				className={
					'h-5 w-5' +
					(mutating || category._isPending
						? ' cursor-not-allowed opacity-50'
						: ' hover:text-destructive cursor-pointer')
				}
				onClick={() => {
					if (mutating || category._isPending) return

					fetcher.submit(
						{ id: category.id, intent: 'child-category' },
						{
							method: 'DELETE',
							action: actionRoute,
						},
					)
				}}
			/>
		</div>
	)
}

export const generateNewCategory = (newCategoryName: string) => {
	const slug = generateSlug(newCategoryName, { fallbackPrefix: 'category' })

	return {
		// postgres integer -2147483648 to +2147483647
		id: -(Math.floor(Math.random() * 2147483648) + 1),
		name: newCategoryName,
		slug,
		description: '',
		parentId: null,
		children: [],
		posts: [],
	} satisfies CategoryType
}

// Categories Section Component (Middle)
export const CategoriesSection = ({
	categories,
	selectedCategoryId,
	setSelectedCategoryId,
}: {
	categories: (CategoryType & { _isPending?: true })[]
	selectedCategoryId: number | null
	setSelectedCategoryId: (id: number) => void
}) => {
	const [newCategoryName, setNewCategoryName] = useState('')
	const [filter, setFilter] = useState('')
	const submit = useSubmit()

	const addCategory = () => {
		if (!newCategoryName.trim()) return

		const newCategory = generateNewCategory(newCategoryName)

		submit(
			{ ...newCategory, intent: 'category' },
			{ method: 'POST', action: actionRoute, navigate: false },
		)
		setNewCategoryName('')
	}

	const handleCategorySelect = (id: number) => {
		setSelectedCategoryId(id)
	}

	const filteredCategories = categories.filter(category =>
		category.name.toLowerCase().includes(filter.toLowerCase()),
	)

	return (
		<div className="flex min-h-0 flex-1 flex-col rounded-lg border p-4 shadow-xs lg:h-full lg:flex-none">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold">Categories</h2>
				<Dialog>
					<DialogTrigger className="cursor-pointer">
						<PlusCircle size={20} />
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add category</DialogTitle>
							<DialogDescription></DialogDescription>
						</DialogHeader>
						<Form
							id="add-category-form"
							onSubmit={e => {
								e.preventDefault()
								addCategory()
							}}
							className="flex items-center gap-2"
						>
							<Input
								placeholder="New category name..."
								value={newCategoryName}
								onChange={e => setNewCategoryName(e.target.value)}
								className="flex-1"
							/>
							<DialogClose asChild>
								<Button type="submit" size="sm">
									<PlusCircle />
									Create
								</Button>
							</DialogClose>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<Input
				placeholder="Filter categories..."
				value={filter}
				onChange={e => setFilter(e.target.value)}
				className="mb-4"
			/>

			<ScrollArea className="min-h-0 flex-1">
				<div className="space-y-2">
					{filteredCategories.length > 0 ? (
						filteredCategories.map(category => (
							<CategoryComponent
								cat={category}
								key={category.id}
								selectedCategoryId={selectedCategoryId}
								onClick={() =>
									!category._isPending && handleCategorySelect(category.id)
								}
							/>
						))
					) : (
						<div className="text-muted-foreground py-8 text-center">
							{filter ? 'No categories found' : 'No categories yet'}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}

export const generateNewChildCategory = (
	newChildCategoryName: string,
	parentId: number,
) => {
	const slug = generateSlug(newChildCategoryName, {
		fallbackPrefix: 'child-category',
	})

	return {
		// postgres integer -2147483648 to +2147483647
		id: -(Math.floor(Math.random() * 2147483648) + 1),
		name: newChildCategoryName,
		slug,
		description: '',
		parentId: parentId,
		children: [],
		posts: [],
	} satisfies CategoryType
}

// Category Hierarchy Section Component (Right)
export const CategoryHierarchySection = ({
	category,
}: {
	category: CategoryType | null
}) => {
	const [newChildCategoryName, setNewChildCategoryName] = useState('')
	const [filter, setFilter] = useState('')
	const submit = useSubmit()

	const addChildCategory = () => {
		if (!category?.id || !newChildCategoryName.trim()) return

		const newChildCategory = generateNewChildCategory(
			newChildCategoryName,
			category.id,
		)

		submit(
			{ ...newChildCategory, intent: 'child-category' },
			{ method: 'POST', action: actionRoute, navigate: false },
		)
		setNewChildCategoryName('')
	}

	const filteredChildren =
		category?.children.filter(child =>
			child.name.toLowerCase().includes(filter.toLowerCase()),
		) || []

	return (
		<div className="flex min-h-0 flex-1 flex-col rounded-lg border p-4 shadow-xs lg:h-full lg:flex-none">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold">
					{category ? (
						<>
							{category?.name}{' '}
							<span className="text-muted-foreground text-sm">children</span>
						</>
					) : (
						'Children categories'
					)}
				</h2>
				<Dialog>
					<DialogTrigger
						className={`${category ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
						disabled={!category}
					>
						<PlusCircle size={20} />
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add child category</DialogTitle>
							<DialogDescription></DialogDescription>
						</DialogHeader>
						<Form
							onSubmit={e => {
								e.preventDefault()
								addChildCategory()
							}}
							className="mb-4 flex items-center gap-2"
						>
							<Input
								placeholder="New child category name..."
								value={newChildCategoryName}
								onChange={e => setNewChildCategoryName(e.target.value)}
								className="flex-1"
							/>
							<DialogClose asChild>
								<Button type="submit" size="sm">
									<PlusCircle />
									Create
								</Button>
							</DialogClose>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			{category ? (
				<>
					<Input
						placeholder="Filter child categories..."
						value={filter}
						onChange={e => setFilter(e.target.value)}
						className="mb-4"
					/>

					<ScrollArea className="min-h-0 flex-1">
						<div className="space-y-2">
							{filteredChildren && filteredChildren.length > 0 ? (
								filteredChildren.map(childCategory => (
									<ChildCategoryComponent
										category={childCategory}
										key={childCategory.id}
									/>
								))
							) : (
								<div className="text-muted-foreground py-8 text-center">
									{filter
										? 'No child categories found'
										: 'No child categories yet'}
								</div>
							)}
						</div>
					</ScrollArea>
				</>
			) : (
				<div className="text-muted-foreground flex h-[400px] items-center justify-center">
					Please select a category to view its children
				</div>
			)}
		</div>
	)
}
