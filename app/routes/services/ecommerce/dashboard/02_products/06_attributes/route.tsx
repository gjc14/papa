import type { Route } from './+types/route'

import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { getEcAttributes } from '../../../lib/db/taxonomy.server'
import { CreateTaxonomyDialog } from '../../components/create-taxonomy-dialog'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const attrs = await getEcAttributes()
	return { attrs }
}

export default function ECAttributes({ loaderData }: Route.ComponentProps) {
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
			{/* Your main content goes here */}
			<DashboardContent>
				{loaderData.attrs.map(attr => (
					<div key={attr.id}>{attr.name}</div>
				))}
			</DashboardContent>
		</DashboardLayout>
	)
}
