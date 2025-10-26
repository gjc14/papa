import { useEffect } from 'react'
import { Link, useFetcher } from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/ui/badge'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { PostWithRelations } from '~/lib/db/post.server'
import { DashboardDataTableMoreMenu } from '~/routes/papa/dashboard/components/data-table'

import { SimpleSortHeader } from '../../components/data-table/simple-sort-header'

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
				case 'scheduled':
					variant = 'default'
					break
				case 'trashed':
					variant = 'destructive'
					break
				case 'archived':
					variant = 'outline'
					break
				case 'other':
					variant = 'outline'
					break
				default:
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
			const fetcher = useFetcher()
			const { mutating } = useFetcherNotification(fetcher)

			const rowId = row.id
			const id = row.original.id
			const slug = row.original.slug
			const title = row.original.title

			useEffect(() => {
				if (mutating) {
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
			}, [mutating])

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
