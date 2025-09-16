import type { Route } from './+types/route'
import { useEffect, useMemo, useState } from 'react'
import {
	data,
	Form,
	Link,
	useFetcher,
	useNavigation,
	useSubmit,
} from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'
import { useAtom } from 'jotai'
import debounce from 'lodash/debounce'
import { PlusCircle } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { InputSearch } from '~/components/ui/input-search'
import { Loading } from '~/components/loading'
import type { PostWithRelations } from '~/lib/db/post.server'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardSectionWrapper,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'
import {
	DashboardDataTableMoreMenu,
	DataTable,
} from '~/routes/papa/dashboard/components/data-table'

import { SimpleSortHeader } from '../../components/data-table/simple-sort-header'
import { categoriesAtom, tagsAtom } from '../context'
import { fetchPosts, headers, postsServerMemoryCache, TTL } from './cache'

export const meta = () => {
	return [{ name: 'title', content: 'Dashboard Blog' }]
}

/**
 * @see file [web blog index route.tsx](../../../../web/blog/index/route.tsx)
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
	const url = new URL(request.url)
	const { searchParams } = url
	const categories = searchParams.get('category')?.split(',')
	const tags = searchParams.get('tag')?.split(',')
	const q = searchParams.get('q') || undefined

	const cacheKey = searchParams.toString()
	const now = Date.now()
	const entry = postsServerMemoryCache.get(cacheKey)

	// cache hit
	if (entry && entry.data && entry.expiresAt > now) {
		return data(entry.data, { headers })
	}

	// inflight dedupe
	if (entry?.promise) {
		const payload = await entry.promise
		return data(payload, { headers })
	}

	// cache miss
	const promise = fetchPosts(url, categories, tags, q)
	postsServerMemoryCache.set(cacheKey, { expiresAt: 0, promise })

	const payload = await promise
	postsServerMemoryCache.set(cacheKey, {
		data: payload,
		expiresAt: Date.now() + TTL,
	})

	return data(payload, { headers })
}

export default function DashboardPost({ loaderData }: Route.ComponentProps) {
	const { posts, categoriesFilter, tagsFilter, q } = loaderData

	const navigation = useNavigation()

	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has('q')

	const isNavigating = navigation.state === 'loading' && !searching

	const [tags] = useAtom(tagsAtom)
	const [category] = useAtom(categoriesAtom)

	const [rowSelection, setRowSelection] = useState({})
	const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())

	useEffect(() => {
		console.log('rowSelection', rowSelection)
	}, [rowSelection, rowsDeleting])

	const tableData = useMemo(() => {
		return posts.map(p => {
			return { ...p, setRowsDeleting }
		})
	}, [posts])

	if (isNavigating) {
		return (
			<div className="mx-auto flex h-full flex-1 flex-col items-center justify-center space-y-6">
				<Loading />
			</div>
		)
	}

	return (
		<DashboardSectionWrapper className="gap-2">
			<DashboardHeader>
				<DashboardTitle title="Posts"></DashboardTitle>
				<DashboardActions>
					<Search q={q} searching={searching} />
					<Link to="/dashboard/blog/new">
						<Button size={'sm'}>
							<PlusCircle size={16} />
							<p className="text-xs">Create new post</p>
						</Button>
					</Link>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent>
				<DataTable
					columns={columns}
					data={tableData}
					hideColumnFilter
					rowSelection={rowSelection}
					setRowSelection={setRowSelection}
					rowGroupStyle={[
						{
							rowIds: rowsDeleting,
							className: 'opacity-50 pointer-events-none',
						},
					]}
				/>
			</DashboardContent>
		</DashboardSectionWrapper>
	)
}

const Search = ({ q, searching }: { q?: string; searching?: boolean }) => {
	const submit = useSubmit()

	// Sync search input with URL param
	useEffect(() => {
		const searchField = document.getElementById('q')
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || ''
		}
	}, [q])

	const debouncedSearch = useMemo(
		() =>
			debounce((form: HTMLFormElement) => {
				submit(form)
			}, 600),
		[submit],
	)

	useEffect(() => {
		return () => {
			debouncedSearch.cancel()
		}
	}, [debouncedSearch])

	return (
		<Form
			id="search-form"
			role="search"
			onChange={event => {
				debouncedSearch(event.currentTarget)
			}}
			className="relative"
		>
			<InputSearch
				isLoading={searching}
				aria-label="Search posts"
				defaultValue={q || ''}
				id="q"
				name="q"
			/>
		</Form>
	)
}

export const columns: ColumnDef<
	PostWithRelations & {
		setRowsDeleting: React.Dispatch<React.SetStateAction<Set<string>>>
	}
>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Title</SimpleSortHeader>
		},
		cell(props) {
			const slug = props.row.original.slug
			const title = props.row.original.title
			return (
				<Link to={slug} className="cursor-pointer hover:underline">
					{title}
				</Link>
			)
		},
	},
	{
		accessorKey: 'excerpt',
		header: 'Excerpt',
	},
	{
		accessorKey: 'status',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Status</SimpleSortHeader>
		},
		cell(props) {
			const status = props.row.original.status
			let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
				'default'
			switch (status.toLowerCase()) {
				case 'draft':
					variant = 'secondary'
					break
				case 'published':
					variant = 'default'
					break
				case 'trashed':
					variant = 'destructive'
					break
				case 'archived':
					variant = 'secondary'
					break
				case 'policy':
					variant = 'outline'
					break
				default:
					variant = 'default'
					break
			}
			return (
				<Badge className="rounded-full" variant={variant}>
					{status}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'author',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Author</SimpleSortHeader>
		},
		accessorFn: row => row.author?.name || 'author',
	},
	{
		id: 'Updated At',
		accessorKey: 'updatedAt',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Updated At</SimpleSortHeader>
		},
		cell: info => info.getValue<Date>().toLocaleString('zh-TW'),
		accessorFn: row => new Date(row.updatedAt),
	},
	{
		accessorKey: 'id',
		header: 'Edit',
		cell: props => {
			const row = props.row
			const hi = props.row
			const fetcher = useFetcher()

			const rowId = row.id
			const id = row.original.id
			const slug = row.original.slug
			const title = row.original.title

			useEffect(() => {
				if (fetcher.state !== 'idle') {
					row.original.setRowsDeleting(prev => {
						const newSet = new Set(prev)
						newSet.add(rowId)
						return newSet
					})
				} else {
					row.original.setRowsDeleting(prev => {
						const newSet = new Set(prev)
						newSet.delete(rowId)
						return newSet
					})
				}
			}, [fetcher.state])

			return (
				<DashboardDataTableMoreMenu
					id={id}
					deleteTarget={title}
					onDelete={() => {
						fetcher.submit(
							{ id },
							{
								method: 'DELETE',
								action: `/dashboard/blog/resource`,
								encType: 'application/json',
							},
						)
					}}
				>
					<Link to={`/dashboard/blog/${slug}`}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</Link>
				</DashboardDataTableMoreMenu>
			)
		},
	},
]
