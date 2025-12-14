import type { Route } from './+types/route'
import { useEffect, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'

import { type ColumnDef, type Table } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { PlusCircle } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { useFetcherNotification } from '~/hooks/use-notification'
import {
	DashboardDataTable,
	DashboardDataTableMoreMenu,
} from '~/routes/papa/dashboard/components/dashboard-data-table'
import { useSkipper } from '~/routes/papa/dashboard/components/dashboard-data-table/hooks'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { getProducts } from '../../../lib/db/product.server'
import { storeConfigAtom } from '../../../store/product/context'
import {
	renderPrice,
	toScaledDecimalString,
} from '../../../store/product/utils/price'

export const loader = async () => {
	const products = await getProducts({ relations: true, status: 'ALL' })
	return { products }
}

type Product = Awaited<ReturnType<typeof getProducts>>[number]

export default function ECProductsIndex({ loaderData }: Route.ComponentProps) {
	const tableRef = useRef<Table<Product>>(null)
	const [shouldSkip, skip] = useSkipper()
	const [state, setState] = useState(loaderData.products)

	useEffect(() => {
		skip()
		setState(loaderData.products)
	}, [loaderData])

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Products"></DashboardTitle>
				<DashboardActions>
					<Button asChild size={'sm'}>
						<Link to="new">
							<PlusCircle /> New Product
						</Link>
					</Button>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent className="px-0 md:px-0">
				<DashboardDataTable
					columns={columns}
					data={state}
					setData={setState}
					ref={tableRef}
					autoResetPageIndex={shouldSkip}
					skipAutoResetPageIndex={skip}
					className="px-2 md:px-3"
					initialPageSize={20}
				/>
			</DashboardContent>
		</DashboardLayout>
	)
}

export const columns: ColumnDef<Product>[] = [
	// TODO: stock management
	{
		accessorKey: 'id',
		header: 'Image',
		cell: ({ row }) => {
			const storeConfig = useAtomValue(storeConfigAtom)
			const slug = row.original.slug
			const name = row.original.name
			const image = row.original.option.image
			return (
				<div className="flex items-center">
					<Link
						to={slug}
						className="focus-visible:ring-ring/50 inline-block cursor-pointer hover:underline focus-visible:ring-2 focus-visible:outline-0"
					>
						<img
							src={image || storeConfig.placeholderImage.image}
							alt={
								name ||
								storeConfig.placeholderImage.imageAlt ||
								storeConfig.name
							}
							className="size-12 object-cover"
						/>
					</Link>
				</div>
			)
		},
	},
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => {
			const slug = row.original.slug
			const name = row.original.name
			return (
				<Link
					to={slug}
					className="focus-visible:ring-ring/50 cursor-pointer hover:underline focus-visible:ring-2 focus-visible:outline-0"
				>
					{name}
				</Link>
			)
		},
	},
	{
		accessorFn: originalRow => originalRow.option.price,
		header: 'Price',
		cell: ({ row }) => {
			const { hasDiscount, formattedPrice, formattedOriginalPrice } =
				renderPrice(row.original.option)

			return (
				<div className="flex flex-col">
					{formattedPrice}
					{hasDiscount && (
						<span className="text-muted-foreground text-xs line-through">
							{formattedOriginalPrice}
						</span>
					)}
				</div>
			)
		},
		sortingFn: (a, b) => {
			const optA = a.original.option
			const optB = b.original.option

			const rawPriceA = toScaledDecimalString(optA.price, optA.scale)
			const rawPriceB = toScaledDecimalString(optB.price, optB.scale)

			const cA = optA.currency
			const cB = optB.currency

			// Step 1: compare currency
			if (cA < cB) return -1
			if (cA > cB) return 1

			// Step 2: compare rawPrice if currency is the same
			return Number(rawPriceA) - Number(rawPriceB)
		},
	},
	{
		accessorFn: originalRow => originalRow.option.sku,
		header: 'SKU',
		cell: ({ row }) => row.original.option.sku || '—',
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status
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
		accessorKey: 'updatedAt',
		header: 'Updated At',
		cell: ({ row }) => row.original.updatedAt.toLocaleString('zh-TW'),
	},
	{
		id: '_actions',
		cell: ({ row }) => {
			const fetcher = useFetcher()
			const { mutating } = useFetcherNotification(fetcher)

			const id = row.original.id
			const slug = row.original.slug
			const name = row.original.name

			return (
				<DashboardDataTableMoreMenu
					id={id}
					deletable={true}
					onDelete={() => {
						fetcher.submit([{ id, name }], {
							method: 'DELETE',
							action: `resource`,
							encType: 'application/json',
						})
					}}
					permanent={false}
					deleteTarget={name}
					mutating={mutating}
				>
					<Link to={slug}>
						<DropdownMenuItem>Edit</DropdownMenuItem>
					</Link>
				</DashboardDataTableMoreMenu>
			)
		},
	},
]
