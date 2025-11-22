import type { Route } from './+types/route'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { ColumnDef, Table } from '@tanstack/react-table'

import { DashboardDataTable } from '~/routes/papa/dashboard/components/dashboard-data-table'
import { useSkipper } from '~/routes/papa/dashboard/components/dashboard-data-table/hooks'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { getEcCategories } from '../../../lib/db/taxonomy.server'
import { CreateTaxonomyDialog } from '../../components/taxonomy/create-taxonomy-dialog'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const categories = await getEcCategories()
	return { categories }
}

export type Category = Awaited<ReturnType<typeof getEcCategories>>[number]

export default function ECCategories({ loaderData }: Route.ComponentProps) {
	const tableRef = useRef<Table<Category>>(null)
	const [state, setState] = useState(loaderData.categories)
	const [shouldSkip, skip] = useSkipper()

	useEffect(() => {
		skip()
		setState(loaderData.categories)
	}, [loaderData])

	const columns = useMemo(() => createCategoryColumns(), [])

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Categories"></DashboardTitle>
				<DashboardActions>
					<CreateTaxonomyDialog
						data={loaderData.categories}
						config={{
							name: 'Category',
							pluralName: 'Categories',
							actionEndpoint: 'resource',
							hasDescription: true,
							hasParent: true,
							hasImage: true,
							namePlaceholder: 'Literatures',
							slugPlaceholder: 'literatures',
						}}
					/>
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
					initialPageSize={50}
				/>
			</DashboardContent>
		</DashboardLayout>
	)
}

const createCategoryColumns = (): ColumnDef<Category>[] => {
	return [
		{
			header: 'Image',
			footer: props => props.column.id,
			accessorKey: 'image',
			cell: ({ row }) => {
				const src = row.original.image
				return src ? (
					<img
						src={src}
						alt="Brand Image"
						className="m-2 h-10 w-10 object-cover"
					/>
				) : null
			},
		},
		{
			header: 'Name',
			footer: props => props.column.id,
			accessorKey: 'name',
		},
		{
			header: 'Slug',
			footer: props => props.column.id,
			accessorKey: 'slug',
		},
		{
			header: 'Description',
			footer: props => props.column.id,
			accessorKey: 'description',
		},
	]
}
