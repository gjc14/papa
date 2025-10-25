import { useEffect } from 'react'
import { Link, useFetcher } from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/ui/badge'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { useFetcherNotification } from '~/hooks/use-notification'
import { DashboardDataTableMoreMenu } from '~/routes/papa/dashboard/components/data-table'
import { SimpleSortHeader } from '~/routes/papa/dashboard/components/data-table/simple-sort-header'

import type { ProductListingWithRelations } from '../../../lib/db/product.server'

export const columns: ColumnDef<
	ProductListingWithRelations & {
		setRowsDeleting: React.Dispatch<React.SetStateAction<Set<string>>>
	}
>[] = [
	// TODO: stock management
	{
		accessorKey: 'image',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Image</SimpleSortHeader>
		},
		cell(props) {
			const slug = props.row.original.slug
			const name = props.row.original.name
			const image = props.row.original.option.image
			return (
				<Link to={slug} className="cursor-pointer hover:underline">
					{image ? (
						<img src={image} alt={name} className="h-16 w-16 object-cover" />
					) : (
						'⛰️'
					)}
				</Link>
			)
		},
	},
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Name</SimpleSortHeader>
		},
		cell(props) {
			const slug = props.row.original.slug
			const name = props.row.original.name
			return (
				<Link to={slug} className="cursor-pointer hover:underline">
					{name}
				</Link>
			)
		},
	},
	{
		accessorKey: 'price',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Price</SimpleSortHeader>
		},
		cell(props) {
			const price = props.row.original.option.price
			const salePrice = props.row.original.option.salePrice
			const displayPrice = salePrice || price
			const hasDiscount = !!salePrice && salePrice < price

			return (
				<div className="flex flex-col">
					<span>${displayPrice}</span>
					{hasDiscount && (
						<span className="text-muted-foreground text-xs line-through">
							${price}
						</span>
					)}
				</div>
			)
		},
	},
	{
		accessorKey: 'sku',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>SKU</SimpleSortHeader>
		},
		cell(props) {
			return props.row.original.option.sku || '—'
		},
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
			switch (status) {
				case 'DRAFT':
					variant = 'secondary'
					break
				case 'PUBLISHED':
					variant = 'default'
					break
				case 'SCHEDULED':
					variant = 'default'
					break
				case 'TRASHED':
					variant = 'destructive'
					break
				case 'ARCHIVED':
					variant = 'outline'
					break
				case 'OTHER':
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
			const name = row.original.name

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
			}, [fetcher.state])

			return (
				<DashboardDataTableMoreMenu
					id={id}
					deleteTarget={name}
					onDelete={() => {
						fetcher.submit([{ id, name }], {
							method: 'DELETE',
							action: `resource`,
							encType: 'application/json',
						})
					}}
					permanent={false}
				>
					<Link to={slug}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</Link>
				</DashboardDataTableMoreMenu>
			)
		},
	},
]
