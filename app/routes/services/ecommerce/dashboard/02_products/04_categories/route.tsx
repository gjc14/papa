import type { Route } from './+types/route'

import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { getEcCategories } from '../../../lib/db/taxonomy.server'
import { CreateTaxonomyDialog } from '../../components/create-taxonomy-dialog'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const categories = await getEcCategories()
	return { categories }
}

export default function ECCategories({ loaderData }: Route.ComponentProps) {
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
			{/* Your main content goes here */}
			<DashboardContent>
				{loaderData.categories.map(category => (
					<div key={category.id}>{category.name}</div>
				))}
			</DashboardContent>
		</DashboardLayout>
	)
}
