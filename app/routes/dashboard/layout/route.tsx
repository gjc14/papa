import type { Route } from './+types/route'
import { memo, useEffect, useMemo } from 'react'
import { Link, redirect, Outlet as RROutlet, useNavigation } from 'react-router'

import { useAtom } from 'jotai'
import { Undo2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	SIDEBAR_COOKIE_NAME,
	SidebarInset,
	SidebarProvider,
} from '~/components/ui/sidebar'
import { Spinner } from '~/components/ui/spinner'
import { DashboardLayout } from '~/components/dashboard/dashboard-wrapper'
import { DashboardSidebar } from '~/components/dashboard/sidebar'
import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from '~/components/error-boundary-template'
import { auth } from '~/lib/auth/auth.server'
import { authContext } from '~/middleware/context/auth'

import { HeaderWithBreadcrumbs } from './components/header-breadcrumbs'
import { dashboardContextAtom } from './context'

const MemoDashboardSidebar = memo(DashboardSidebar)
const MemoHeaderWithBreadcrumb = memo(HeaderWithBreadcrumbs)

const authMiddleware: Route.MiddlewareFunction = async (
	{ request, context },
	next,
) => {
	const { response: session, headers } = await auth.api.getSession({
		headers: request.headers,
		returnHeaders: true,
	})
	if (!session || session.user.role !== 'admin') {
		throw redirect('/dashboard/portal')
	}
	context.set(authContext, session)

	// Merge better auth set cookies with downstream
	const res = await next()
	const cookies = headers.getSetCookie()
	for (const c of cookies) res.headers.append('Set-Cookie', c)

	return res
}

export const middleware = [authMiddleware]

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const adminSession = context.get(authContext)

	const defaultSidebarOpen = new RegExp(`${SIDEBAR_COOKIE_NAME}=true`).test(
		request.headers.get('cookie') || '',
	)

	return {
		admin: adminSession.user,
		defaultSidebarOpen,
	}
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { admin, defaultSidebarOpen } = loaderData

	const memoizedUser = useMemo(
		() => ({
			...admin,
			name: admin.name ?? 'User',
			image: admin.image ?? '/placeholders/avatar.png',
			role: admin.role ?? 'admin',
		}),
		[admin],
	)

	return (
		<SidebarProvider defaultOpen={defaultSidebarOpen}>
			{/* Re-render only when user reference changes */}
			<MemoDashboardSidebar user={memoizedUser} />

			<SidebarInset className="h-[calc(100svh-(--spacing(4)))] overflow-hidden">
				<MemoHeaderWithBreadcrumb />

				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	)
}

const Outlet = () => {
	const navigation = useNavigation()
	const [dashboardContext, setDashboardContext] = useAtom(dashboardContextAtom)

	// Use context during 'loading', fall back to location.state after loader completes
	const shouldShowLoader =
		navigation.state === 'loading' &&
		dashboardContext.navigation.showGlobalLoader

	useEffect(() => {
		if (navigation.state === 'idle') {
			setDashboardContext(prev => ({
				...prev,
				navigation: { showGlobalLoader: true },
			})) // Reset to default
		}
	}, [navigation.state, setDashboardContext])

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

				<Button
					variant={'link'}
					render={
						<Link to={returnTo} className="mt-5">
							<span>
								Return to <code>{returnTo}</code>
							</span>
							<Undo2 size={12} />
						</Link>
					}
				/>
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
