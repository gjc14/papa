import { useEffect } from 'react'
import { Link, useFetcher } from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/ui/badge'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { DashboardDataTableMoreMenu } from '~/components/dashboard/dashboard-data-table'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { PostWithRelations } from '~/lib/db/post.server'

export const columns: ColumnDef<PostWithRelations>[] = [
	{
		accessorKey: 'title',
		header: 'Title',
		cell: ({ row }) => {
			const slug = row.original.slug
			const title = row.original.title
			return (
				<div className="py-2">
					<Link
						to={slug}
						className="line-clamp-3 cursor-pointer break-words whitespace-normal hover:underline"
					>
						{title}
					</Link>
				</div>
			)
		},
	},
	{
		accessorKey: 'excerpt',
		header: 'Excerpt',
		cell: ({ row }) => {
			const excerpt = row.original.excerpt
			return (
				<div className="py-2">
					<p className="line-clamp-3 text-sm break-words whitespace-normal">
						{excerpt || '-'}
					</p>
				</div>
			)
		},
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status
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
		header: 'Author',
		cell: ({ row }) => row.original.author?.name || '—',
	},
	{
		accessorKey: 'updatedAt',
		header: 'Updated At',
		cell: ({ row }) => row.original.updatedAt.toLocaleString('zh-TW'),
	},
	{
		id: '_actions',
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
					// row.original.setRowsDeleting(prev => {
					// 	const newSet = new Set(prev)
					// 	newSet.add(rowId)
					// 	return newSet
					// })
				} else {
					// row.original.setRowsDeleting(prev => {
					// 	const newSet = new Set(prev)
					// 	newSet.delete(rowId)
					// 	return newSet
					// })
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
