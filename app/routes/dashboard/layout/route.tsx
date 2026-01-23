import type { Route } from './+types/route'
import { memo, useEffect, useMemo, useState } from 'react'
import {
	Link,
	redirect,
	Outlet as RROutlet,
	useLocation,
	useNavigation,
} from 'react-router'

import { Undo2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	SIDEBAR_COOKIE_NAME,
	SidebarInset,
	SidebarProvider,
} from '~/components/ui/sidebar'
import { Spinner } from '~/components/ui/spinner'
import { DashboardLayout } from '~/components/dashboard/dashboard-wrapper'
import type { ServiceDashboardConfig } from '~/components/dashboard/service-swicher'
import { DashboardSidebar } from '~/components/dashboard/sidebar'
import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from '~/components/error-boundary-template'

import { validateAdminSession } from '../../auth/utils'
import { getServiceDashboardConfigs } from '../../utils/service-configs'
import {
	DEFAULT_MAIN_NAV_ITEMS,
	DEFAULT_SECONDARY_NAV_ITEMS,
	DEFAULT_SERVICE,
} from './components/data'
import { HeaderWithBreadcrumbs } from './components/header-breadcrumbs'
import { NavigationProvider, useNavigationMetadata } from './context'

const MemoDashboardSidebar = memo(DashboardSidebar)
const MemoHeaderWithBreadcrumb = memo(HeaderWithBreadcrumbs)

export const loader = async ({ request }: Route.LoaderArgs) => {
	const usesrSession = await validateAdminSession(request)

	const defaultSidebarOpen = new RegExp(`${SIDEBAR_COOKIE_NAME}=true`).test(
		request.headers.get('cookie') || '',
	)

	if (!usesrSession) {
		throw redirect('/dashboard/portal')
	}

	return {
		admin: usesrSession.user,
		defaultSidebarOpen,
	}
}

export default function Admin({ loaderData }: Route.ComponentProps) {
	const { admin, defaultSidebarOpen } = loaderData
	const location = useLocation()
	const [isDashboard, setIsDashboard] = useState(true)
	const [currentService, setCurrentService] =
		useState<ServiceDashboardConfig>(DEFAULT_SERVICE)

	const memoizedUser = useMemo(
		() => ({
			...admin,
			name: admin.name ?? 'Papa Fritas',
			image: admin.image ?? '/placeholders/avatar.png',
			role: admin.role ?? 'admin',
		}),
		[admin],
	)

	const serviceDashboardConfigs = useMemo(
		() => getServiceDashboardConfigs(),
		[],
	)

	const availableServices = useMemo(() => {
		const services: ServiceDashboardConfig[] = [
			DEFAULT_SERVICE,
			...serviceDashboardConfigs,
		]
		return services
	}, [serviceDashboardConfigs])

	const currentSidebarItems = useMemo(() => {
		const currentService = serviceDashboardConfigs.find(service =>
			location.pathname.startsWith(service.pathname),
		)

		if (currentService?.sidebar) {
			setIsDashboard(false)
			setCurrentService(currentService)
			return currentService.sidebar
		}

		setIsDashboard(true)
		setCurrentService(DEFAULT_SERVICE)
		return DEFAULT_MAIN_NAV_ITEMS
	}, [location.pathname, serviceDashboardConfigs])

	return (
		<NavigationProvider>
			<SidebarProvider defaultOpen={defaultSidebarOpen}>
				<MemoDashboardSidebar
					user={memoizedUser}
					services={availableServices}
					currentService={currentService}
					mainNavItems={currentSidebarItems}
					secondaryNavItems={
						isDashboard ? DEFAULT_SECONDARY_NAV_ITEMS : undefined
					}
				/>

				<SidebarInset className="h-[calc(100svh-(--spacing(4)))] overflow-hidden">
					<MemoHeaderWithBreadcrumb />

					<title>{`${currentService.name} - Papa CMS`}</title>
					<meta
						name="description"
						content={`Dashboard for ${currentService.name}`}
					/>
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
		</NavigationProvider>
	)
}

const Outlet = () => {
	const navigation = useNavigation()
	const { navMetadata, setNavMetadata } = useNavigationMetadata()

	// Use context during 'loading', fall back to location.state after loader completes
	const shouldShowLoader =
		navigation.state === 'loading' && navMetadata.showGlobalLoader

	useEffect(() => {
		if (navigation.state === 'idle') {
			setNavMetadata({ showGlobalLoader: true }) // Reset to default
		}
	}, [navigation.state, setNavMetadata])

	if (shouldShowLoader) {
		return (
			<DashboardLayout className="items-center justify-center">
				<Spinner />
			</DashboardLayout>
		)
	}

	return <RROutlet />
}

export function ErrorBoundary() {
	return (
		<ErrorBoundaryTemplate>
			{props => <ErrorTemplate {...props} returnTo={'/dashboard'} />}
		</ErrorBoundaryTemplate>
	)
}

const ErrorTemplate = ({
	status,
	statusMessage,
	errorMessage,
	returnTo,
}: ErrorBoundaryTemplateProps & {
	returnTo: string
}) => {
	return (
		<main className="flex h-svh w-screen flex-col items-center justify-center">
			<div className="fixed space-y-3 text-center">
				<div className="flex items-center justify-center">
					<h1 className="mr-5 inline-block border-r pr-5 text-3xl font-normal">
						{status}
					</h1>
					<h2 className="text-base font-light">
						{statusMessage.text || 'Error Page'}
					</h2>
				</div>

				<Button variant={'link'} asChild>
					<Link to={returnTo} className="mt-5">
						<span>
							Return to <code>{returnTo}</code>
						</span>
						<Undo2 size={12} />
					</Link>
				</Button>
			</div>

			<div className="font-open-sans fixed bottom-8 flex items-center">
				<p className="mr-3 inline-block border-r pr-5 text-lg font-normal">
					Papa
				</p>
				<div className="inline-block">
					<p className="text-left text-xs font-light">
						© {new Date().getFullYear()} CHIU YIN CHEN @Taipei
					</p>
				</div>
			</div>
		</main>
	)
}
