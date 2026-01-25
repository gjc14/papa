import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { useAtom } from 'jotai'
import { Check, ChevronDown, Loader2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '~/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import { useNavigationMetadata } from '~/routes/dashboard/layout/context'

import type { Category, Tag } from '../../lib/db/schema'
import { categoriesAtom, tagsAtom } from '../context'

export const Filter = ({
	q,
	tagFilter,
	categoryFilter,
}: {
	q?: string
	tagFilter?: Pick<Tag, 'id' | 'slug' | 'name'>[]
	categoryFilter?: Pick<Category, 'id' | 'slug' | 'name'>[]
}) => {
	const [params, setSearchParams] = useSearchParams()
	const { navMetadata, setNavMetadata } = useNavigationMetadata()
	const searching = navMetadata.showGlobalLoader === false

	const [tags] = useAtom(tagsAtom)
	const [categories] = useAtom(categoriesAtom)

	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState(q || '')
	const [tagsInFilter, setTagsInFilter] = useState<
		Pick<Tag, 'id' | 'slug' | 'name'>[]
	>(tagFilter || [])
	const [categoryInFilter, setCategoryInFilter] = useState<
		Pick<Category, 'id' | 'slug' | 'name'>[]
	>(categoryFilter || [])

	// inner popovers open state
	const [tagsOpen, setTagsOpen] = useState(false)
	const [categoriesOpen, setCategoriesOpen] = useState(false)

	const hasFilter = !!(q || tagFilter?.length || categoryFilter?.length)

	const applyFilter = () => {
		if (searching) return

		// start from the current URL search to preserve all other params (q, category, etc.)
		if (query) {
			params.set('q', query)
		} else {
			params.delete('q')
		}

		if (tagsInFilter.length) {
			params.set('tag', tagsInFilter.map(t => t.slug).join(','))
		} else {
			params.delete('tag')
		}

		if (categoryInFilter.length) {
			params.set('category', categoryInFilter.map(c => c.slug).join(','))
		} else {
			params.delete('category')
		}

		setNavMetadata({ showGlobalLoader: false })
		setSearchParams(params, {
			replace: true,
		})
		// close the main popover after applying
		setOpen(false)
	}

	useEffect(() => {
		setQuery(q || '')
		setTagsInFilter(tagFilter || [])
		setCategoryInFilter(categoryFilter || [])
	}, [q, tagFilter, categoryFilter])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="h-8.5 justify-between text-xs"
				>
					{searching ? <Loader2 className="animate-spin" /> : null}
					Filters
					{hasFilter && (
						<span className="size-1.5 shrink-0 rounded-full bg-current"></span>
					)}
					<ChevronDown className="opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[360px] p-2">
				{/* Search input */}
				<div className="mb-2">
					<Command>
						<CommandInput
							placeholder="Post title..."
							className="h-9"
							value={query}
							onValueChange={(val: string) => setQuery(val)}
						/>
					</Command>
				</div>

				{/* Buttons that open inner popovers for Tags and Categories */}
				<div className="mb-2 flex items-center gap-2">
					{/* Tags popover */}
					<Popover open={tagsOpen} onOpenChange={setTagsOpen}>
						<PopoverTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								className="flex-1 justify-between"
							>
								<span>
									Tags
									{tagsInFilter.length > 0 && (
										<span className="text-muted-foreground ml-2 text-xs">
											{tagsInFilter.length}
										</span>
									)}
								</span>
								<ChevronDown className="opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[220px] p-0">
							<Command>
								<CommandInput placeholder="Search tags..." className="h-9" />
								<CommandList>
									<CommandEmpty>No tags found.</CommandEmpty>
									<CommandGroup>
										{tags.map(t => (
											<CommandItem
												key={t.slug}
												value={t.slug}
												onSelect={currentValue => {
													setTagsInFilter(prev =>
														prev.some(tag => tag.slug === currentValue)
															? prev.filter(tag => tag.slug !== currentValue)
															: [...prev, t],
													)
												}}
											>
												{t.name}
												<Check
													className={cn(
														'ml-auto',
														tagsInFilter.some(tag => tag.slug === t.slug)
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
								<CommandSeparator />
								<div className="p-2">
									<Button
										size="sm"
										className="w-[100%]"
										onClick={() => setTagsOpen(false)}
									>
										Done
									</Button>
								</div>
							</Command>
						</PopoverContent>
					</Popover>
					<span className="text-xs">&</span>

					{/* Categories popover */}
					<Popover open={categoriesOpen} onOpenChange={setCategoriesOpen}>
						<PopoverTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								className="flex-1 justify-between"
							>
								<span>
									Categories
									{categoryInFilter.length > 0 && (
										<span className="text-muted-foreground ml-2 text-xs">
											{categoryInFilter.length}
										</span>
									)}
								</span>
								<ChevronDown className="opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[220px] p-0">
							<Command>
								<CommandInput
									placeholder="Search categories..."
									className="h-9"
								/>
								<CommandList>
									<CommandEmpty>No categories found.</CommandEmpty>
									<CommandGroup>
										{categories.map(c => (
											<CommandItem
												key={c.slug}
												value={c.slug}
												onSelect={currentValue => {
													setCategoryInFilter(prev =>
														prev.some(cat => cat.slug === currentValue)
															? prev.filter(cat => cat.slug !== currentValue)
															: [...prev, c],
													)
												}}
											>
												{c.name}
												<Check
													className={cn(
														'ml-auto',
														categoryInFilter.some(cat => cat.slug === c.slug)
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
								<CommandSeparator />
								<div className="p-2">
									<Button
										size="sm"
										className="w-[100%]"
										onClick={() => setCategoriesOpen(false)}
									>
										Done
									</Button>
								</div>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{/* Apply button for all filters */}
				<div>
					<Button
						size="sm"
						className="w-full"
						onClick={applyFilter}
						disabled={searching}
					>
						Apply
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}
