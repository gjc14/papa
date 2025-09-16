import type { Route } from './+types/route'
import { useEffect, useMemo, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'
import { PlusCircle } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import type { PostWithRelations } from '~/lib/db/post.server'
import { getPosts } from '~/lib/db/post.server'
import {
	DashboardActions,
	DashboardHeader,
	DashboardSectionWrapper,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'
import {
	DashboardDataTableMoreMenu,
	DataTable,
} from '~/routes/papa/dashboard/components/data-table'

import { SimpleSortHeader } from '../../components/data-table/simple-sort-header'

export const meta = () => {
	return [{ name: 'title', content: 'Dashboard Blog' }]
}

export const loader = async () => {
	try {
		process.env.NODE_ENV === 'development' && console.time('getPosts')
		const postsData = await getPosts({ status: 'ALL' })
		process.env.NODE_ENV === 'development' && console.timeEnd('getPosts')

		return {
			posts: postsData.posts,
		}
	} catch (error) {
		console.error(error)
		return { posts: [] }
	}
}

export default function DashboardPost({ loaderData }: Route.ComponentProps) {
	const { posts } = loaderData

	const [rowSelection, setRowSelection] = useState({})
	const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())

	useEffect(() => {
		console.log('rowSelection', rowSelection)
	}, [rowSelection, rowsDeleting])

	const tableData = useMemo(() => {
		return posts.map(p => {
			return {
				...p,
				setRowsDeleting,
			}
		})
	}, [posts])

	return (
		<DashboardSectionWrapper>
			<DashboardHeader>
				<DashboardTitle title="Posts"></DashboardTitle>
				<DashboardActions>
					<Link to="/dashboard/blog/new">
						<Button size={'sm'}>
							<PlusCircle size={16} />
							<p className="text-xs">Create new post</p>
						</Button>
					</Link>
				</DashboardActions>
			</DashboardHeader>
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
			>
				{table => (
					<Input
						placeholder="Filter title..."
						value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
						onChange={event =>
							table.getColumn('title')?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>
				)}
			</DataTable>
		</DashboardSectionWrapper>
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
