import { memo, useEffect, useMemo, useState } from 'react'
import {
	isRouteErrorResponse,
	Link,
	Outlet,
	redirect,
	useLoaderData,
	useLocation,
	useOutletContext,
	useRouteError,
	type LoaderFunctionArgs,
	type MetaFunction,
} from 'react-router'

import { Undo2 } from 'lucide-react'

import { Breadcrumb, BreadcrumbList } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
	SIDEBAR_COOKIE_NAME,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '~/components/ui/sidebar'
import { FullScreenLoader } from '~/components/loading'
import { authClient } from '~/lib/auth/auth-client'
import { generateBreadcrumbs } from '~/lib/utils'
import { statusCodeMap } from '~/lib/utils/status-code'
import { AdminSidebar } from '~/routes/papa/admin/components/admin-sidebar'
import { getPluginConfigs } from '~/routes/plugins/utils/get-plugin-configs.server'

import { validateAdminSession } from '../auth/utils'

export const meta: MetaFunction = ({ error }) => {
	if (!error) {
		return [{ title: 'Admin' }, { name: 'description', content: 'Admin page' }]
	}
}

const parseSidebarStatus = (cookieHeader: string) => {
	const cookies = Object.fromEntries(
		cookieHeader.split(';').map(cookie => {
			const [name, value] = cookie.trim().split('=')
			return [name, decodeURIComponent(value)]
		}),
	)

	return cookies[SIDEBAR_COOKIE_NAME]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const usesrSession = await validateAdminSession(request)

	if (!usesrSession) {
		throw redirect('/admin/portal')
	}

	const cookieHeader = request.headers.get('Cookie')

	const parsedSidebarStatus = cookieHeader
		? parseSidebarStatus(cookieHeader)
		: null

	const pluginConfigs = await getPluginConfigs()
	const pluginRoutes = pluginConfigs
		.flatMap(config => config.adminRoutes)
		.filter(routeItem => !!routeItem)

	return {
		admin: usesrSession.user,
		pluginRoutes: pluginRoutes,
		sidebarStatus: parsedSidebarStatus === 'true',
	}
}

const MemoAdminSidebar = memo(AdminSidebar)

export default function Admin() {
	const adminLoaderData = useLoaderData<typeof loader>()
	const { admin, pluginRoutes, sidebarStatus } = adminLoaderData
	const { isPending } = authClient.useSession()
	const [isMounted, setIsMounted] = useState(false)

	const memoizedUser = useMemo(
		() => ({
			...admin,
			name: admin.name ?? 'Papa Fritas',
			image: admin.image ?? '/placeholders/avatar.png',
			role: admin.role ?? 'admin',
		}),
		[admin],
	)

	const MemoHeaderWithBreadcrumb = memo(HeaderWithBreadcrumb)
	const memoizedPluginRoutes = useMemo(() => pluginRoutes, [pluginRoutes])

	useEffect(() => {
		setIsMounted(true)
	}, [])

	return (
		<SidebarProvider defaultOpen={sidebarStatus}>
			<MemoAdminSidebar
				user={memoizedUser}
				pluginRoutes={memoizedPluginRoutes}
			/>
			<SidebarInset className="h-[calc(100svh-(--spacing(4)))] overflow-x-hidden">
				{isMounted && isPending && <FullScreenLoader />}
				<MemoHeaderWithBreadcrumb />

				<Outlet context={adminLoaderData} />
			</SidebarInset>
		</SidebarProvider>
	)
}

const HeaderWithBreadcrumb = () => {
	const location = useLocation()
	const breadcrumbPaths = generateBreadcrumbs(location.pathname)

	return (
		<header className="flex my-3 shrink-0 items-center gap-2">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>{breadcrumbPaths}</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	)
}

export const useAdminContext = () => {
	return useOutletContext<Awaited<ReturnType<typeof loader>>>()
}

export function ErrorBoundary() {
	const error = useRouteError()

	// Route throw new Response (404, etc.)
	if (isRouteErrorResponse(error)) {
		console.error('Route Error Response:', error)

		const statusMessage = statusCodeMap[error.status]
		const errorMessage = error.data || statusMessage.text || 'Error Response'

		return (
			<ErrorTemplate
				status={error.status}
				statusText={errorMessage}
				returnTo={'/admin'}
			/>
		)
	} else if (error instanceof Error) {
		// throw new Error('message')
		console.error('Error:', error)

		return (
			<ErrorTemplate
				status={500}
				statusText={'Internal Error'}
				returnTo={'/admin'}
			/>
		)
	}

	console.error('Unknown Error:', error)

	return (
		// Unknown error
		<ErrorTemplate
			status={'XXX'}
			statusText={'Unknown Error'}
			returnTo={'/admin'}
		/>
	)
}

const ErrorTemplate = ({
	status,
	statusText,
	returnTo,
}: {
	status: string | number
	statusText: string
	returnTo: string
}) => {
	return (
		<main className="w-screen h-svh flex flex-col items-center justify-center">
			<div className="fixed text-center">
				<div className="flex items-center justify-center mb-3">
					<h1 className="inline-block mr-5 pr-5 text-3xl font-normal border-r">
						{status}
					</h1>
					<h2 className="text-base font-light">{statusText || 'Error Page'}</h2>
				</div>

				<Link to={returnTo}>
					<Button variant={'link'}>
						<span>
							Return to <code>{returnTo}</code>
						</span>
						<Undo2 size={12} />
					</Button>
				</Link>
			</div>

			<div className="fixed bottom-8 flex items-center font-open-sans">
				<p className="inline-block mr-3 pr-5 text-lg font-normal border-r">
					Papa
				</p>
				<div className="inline-block">
					<p className="text-xs font-light text-left">
						© {new Date().getFullYear()} CHIU YIN CHEN @Taipei
					</p>
				</div>
			</div>
		</main>
	)
}
