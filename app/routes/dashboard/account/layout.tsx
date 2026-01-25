import { Outlet } from 'react-router'

import { useAtom } from 'jotai'

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

import { dashboardContextAtom } from '../layout/context'

const DashboardAccountRoutes: RouteButton[] = [
	{ to: '/dashboard/account', title: 'Profile' },
	{ to: '/dashboard/account/billing', title: 'Billing' },
	{ to: '/dashboard/account/notification', title: 'Notification' },
	{ to: '/dashboard/account/security', title: 'Security' },
]

export default function DashboardAccount() {
	const [dashboardContext, setDashboardContext] = useAtom(dashboardContextAtom)
	const navigating = dashboardContext.navigation.showGlobalLoader === false

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle className="w-full">
					<AnimatedNav
						routes={DashboardAccountRoutes.map(route => ({
							...route,
							onClick: () =>
								setDashboardContext(prev => ({
									...prev,
									navigation: { showGlobalLoader: false },
								})),
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
