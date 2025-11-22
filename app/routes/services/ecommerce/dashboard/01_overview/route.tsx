import { Link } from 'react-router'

import { Button } from '~/components/ui/button'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

export default function ECOverview() {
	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="E-Commerce Overview" />
				<DashboardActions>
					{/* You may put some buttons here */}
					<Button asChild variant={'ghost'} className="border-2 border-dashed">
						<Link to="/store">Go to Storefront</Link>
					</Button>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent>
				{/* This will renders the nested routes */}
				Content goes here
			</DashboardContent>
		</DashboardLayout>
	)
}
