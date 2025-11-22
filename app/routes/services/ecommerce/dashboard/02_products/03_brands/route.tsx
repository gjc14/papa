import type { Route } from './+types/route'

import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { getEcBrands } from '../../../lib/db/taxonomy.server'
import { CreateTaxonomyDialog } from '../../components/create-taxonomy-dialog'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const brands = await getEcBrands()
	return { brands }
}

export default function ECBrands({ loaderData }: Route.ComponentProps) {
	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Brands"></DashboardTitle>
				<DashboardActions>
					<CreateTaxonomyDialog
						data={loaderData.brands}
						config={{
							name: 'Brand',
							pluralName: 'Brands',
							actionEndpoint: 'resource',
							hasDescription: true,
							hasParent: true,
							hasImage: true,
							namePlaceholder: 'Papa',
							slugPlaceholder: 'papa',
						}}
					/>
				</DashboardActions>
			</DashboardHeader>
			{/* Your main content goes here */}
			<DashboardContent>
				{loaderData.brands.map(brand => (
					<div key={brand.id}>{brand.name}</div>
				))}
			</DashboardContent>
		</DashboardLayout>
	)
}
