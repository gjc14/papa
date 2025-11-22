import type { Route } from './+types/route'
import { useState } from 'react'

import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'
import { DataTable } from '~/routes/papa/dashboard/components/data-table'

import { getProducts } from '../../../lib/db/product.server'
import { columns } from './columns'

export const loader = async () => {
	const products = await getProducts({ relations: true, status: 'ALL' })
	return { products }
}

export default function ECProductsIndex({ loaderData }: Route.ComponentProps) {
	const [rowSelection, setRowSelection] = useState({})
	const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())

	const tableData = loaderData.products.map(p => ({
		...p,
		setRowsDeleting,
	}))

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Products"></DashboardTitle>
				<DashboardActions>{/* Some action buttons here */}</DashboardActions>
			</DashboardHeader>
			<DashboardContent>
				<DataTable
					columns={columns}
					data={tableData}
					rowSelection={rowSelection}
					setRowSelection={setRowSelection}
					rowGroupStyle={[
						{
							rowIds: rowsDeleting,
							className: 'opacity-50 pointer-events-none',
						},
					]}
					hideColumnFilter
				/>
			</DashboardContent>
		</DashboardLayout>
	)
}
