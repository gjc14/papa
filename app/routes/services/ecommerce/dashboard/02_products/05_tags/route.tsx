import type { Route } from './+types/route'

import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { getEcTags } from '../../../lib/db/taxonomy.server'
import { CreateTaxonomyDialog } from '../../components/create-taxonomy-dialog'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const tags = await getEcTags()
	return { tags }
}

export default function ECTags({ loaderData }: Route.ComponentProps) {
	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Tags"></DashboardTitle>
				<DashboardActions>
					<CreateTaxonomyDialog
						data={loaderData.tags}
						config={{
							name: 'Tag',
							pluralName: 'Tags',
							actionEndpoint: 'resource',
							hasDescription: true,
							hasImage: true,
							namePlaceholder: 'New Product',
							slugPlaceholder: 'new-roduct',
						}}
					/>
				</DashboardActions>
			</DashboardHeader>
			{/* Your main content goes here */}
			<DashboardContent>
				{loaderData.tags.map(tag => (
					<div key={tag.id}>{tag.name}</div>
				))}
			</DashboardContent>
		</DashboardLayout>
	)
}
