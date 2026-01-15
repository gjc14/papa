import { Outlet } from 'react-router'

import { Spinner } from '~/components/ui/spinner'
import {
	AnimatedNav,
	type RouteButton,
} from '~/components/animated-horizontal-nav'
import {
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/components/dashboard/dashboard-wrapper'

import { useNavigationMetadata } from '../layout/context'

const DashboardCompanyRoutes: RouteButton[] = [
	{ to: '/dashboard/company', title: 'Profile' },
	{ to: '/dashboard/company/billing', title: 'Billing' },
	{ to: '/dashboard/company/notification', title: 'Notification' },
	{ to: '/dashboard/company/security', title: 'Security' },
]

export default function DashboardCompany() {
	const { navMetadata, setNavMetadata } = useNavigationMetadata()
	const navigating = navMetadata.showGlobalLoader === false

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle className="w-full">
					<AnimatedNav
						routes={DashboardCompanyRoutes.map(route => ({
							...route,
							onClick: () => setNavMetadata({ showGlobalLoader: false }),
						}))}
					/>
				</DashboardTitle>
			</DashboardHeader>
			{navigating ? (
				<DashboardContent className="items-center justify-center">
					<Spinner />
				</DashboardContent>
			) : (
				<Outlet />
			)}
		</DashboardLayout>
	)
}
