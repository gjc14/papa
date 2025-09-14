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
import { generateSlug } from '~/lib/utils/seo'

import { actionRoute } from '..'
import type { TagType } from '../type'

// Tag Component
const TagComponent = ({ tag }: { tag: TagType & { _isPending?: true } }) => {
	const fetcher = useFetcher()
	const isDeleting = fetcher.state !== 'idle'

	return (
		<div
			className={`bg-muted flex items-center justify-between rounded-md p-3 ${
				isDeleting ? 'opacity-50' : ''
			}`}
		>
			<div className="font-medium">{tag.name}</div>
			<CircleX
				className={
					'h-5 w-5' +
					(isDeleting || tag._isPending
						? ' cursor-not-allowed opacity-50'
						: ' hover:text-destructive cursor-pointer')
				}
				onClick={() => {
					if (isDeleting || tag._isPending) return

					fetcher.submit(
						{ id: tag.id, intent: 'tag' },
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

export const generateNewTag = (newTagName: string) => {
	const slug = generateSlug(newTagName, { fallbackPrefix: 'tag' })

	return {
		id: -(Math.floor(Math.random() * 2147483648) + 1),
		name: newTagName,
		slug,
		description: '',
		posts: [],
	} satisfies TagType
}

// Tags Section Component (Left)
export const TagsSection = ({ tags }: { tags: TagType[] }) => {
	const [newTagName, setNewTagName] = useState('')
	const [filter, setFilter] = useState('')
	const submit = useSubmit()

	const addTag = () => {
		if (!newTagName.trim()) return
		const newTag = generateNewTag(newTagName)

		submit(
			{ ...newTag, intent: 'tag' },
			{ method: 'POST', action: actionRoute, navigate: false },
		)
		setNewTagName('')
	}

	const filteredTags = tags.filter(tag =>
		tag.name.toLowerCase().includes(filter.toLowerCase()),
	)

	return (
		<div className="flex min-h-0 flex-1 flex-col rounded-lg border p-4 shadow-xs lg:h-full lg:flex-none">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold">標籤</h2>
				<Dialog>
					<DialogTrigger className="cursor-pointer">
						<PlusCircle size={20} />
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>新增標籤</DialogTitle>
							<DialogDescription></DialogDescription>
						</DialogHeader>
						<Form
							onSubmit={e => {
								e.preventDefault()
								addTag()
							}}
							className="flex items-center gap-2"
						>
							<Input
								placeholder="新增標籤名稱"
								value={newTagName}
								onChange={e => setNewTagName(e.target.value)}
								className="flex-1"
							/>
							<DialogClose asChild>
								<Button type="submit" size="sm">
									<PlusCircle />
									新增
								</Button>
							</DialogClose>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<Input
				placeholder="篩選"
				value={filter}
				onChange={e => setFilter(e.target.value)}
				className="mb-4"
			/>

			<ScrollArea className="min-h-0 flex-1">
				<div className="space-y-2">
					{filteredTags.length > 0 ? (
						filteredTags.map(tag => <TagComponent tag={tag} key={tag.id} />)
					) : (
						<div className="text-muted-foreground py-8 text-center">
							{filter ? '查無標籤' : '尚無標籤'}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
