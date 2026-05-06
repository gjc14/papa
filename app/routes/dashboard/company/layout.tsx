import { Outlet } from "react-router"
import { useAtom } from "jotai"
import {
	AnimatedHorizontalNavLinkGroup,
	type RouteButton,
} from "~/components/animated-horizontal-nav-link-group"
import {
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from "~/components/dashboard/dashboard-wrapper"
import { Spinner } from "~/components/ui/spinner"
import { dashboardContextAtom } from "../layout/context"

const DashboardCompanyRoutes: RouteButton[] = [
	{ to: "/dashboard/company", title: "Profile" },
	{ to: "/dashboard/company/billing", title: "Billing" },
	{ to: "/dashboard/company/notification", title: "Notification" },
	{ to: "/dashboard/company/security", title: "Security" },
]

export default function DashboardCompany() {
	const [dashboardContext, setDashboardContext] = useAtom(dashboardContextAtom)
	const navigating = dashboardContext.navigation.showGlobalLoader === false

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle className="w-full">
					<AnimatedHorizontalNavLinkGroup
						links={DashboardCompanyRoutes.map((route) => ({
							...route,
							onClick: () =>
								setDashboardContext((prev) => ({
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
