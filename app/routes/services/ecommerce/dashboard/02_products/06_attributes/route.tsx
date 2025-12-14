import type { Route } from './+types/route'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { ColumnDef, Table } from '@tanstack/react-table'

import { DashboardDataTable } from '~/components/dashboard/dashboard-data-table'
import { useSkipper } from '~/components/dashboard/dashboard-data-table/hooks'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/components/dashboard/dashboard-wrapper'

import { getEcAttributes } from '../../../lib/db/taxonomy.server'
import { CreateTaxonomyDialog } from '../../components/taxonomy/create-taxonomy-dialog'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const attrs = await getEcAttributes()
	return { attrs }
}

export type Attribute = Awaited<ReturnType<typeof getEcAttributes>>[number]

export default function ECAttributes({ loaderData }: Route.ComponentProps) {
	const tableRef = useRef<Table<Attribute>>(null)
	const [state, setState] = useState(loaderData.attrs)
	const [shouldSkip, skip] = useSkipper()

	useEffect(() => {
		skip()
		setState(loaderData.attrs)
	}, [loaderData])

	const columns = useMemo(() => createAttributeColumns(), [])

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Attributes"></DashboardTitle>
				<DashboardActions>
					<CreateTaxonomyDialog
						data={loaderData.attrs}
						config={{
							name: 'Attribute',
							pluralName: 'Attributes',
							actionEndpoint: 'resource',
							hasValue: true,
							namePlaceholder: 'Papa',
							slugPlaceholder: 'papa',
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

const createAttributeColumns = (): ColumnDef<Attribute>[] => {
	return [
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
			header: 'Value',
			footer: props => props.column.id,
			accessorKey: 'value',
		},
	]
}
