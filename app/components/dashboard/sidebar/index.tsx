import { useMemo } from 'react'
import { useLocation, useMatches } from 'react-router'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from '~/components/ui/sidebar'
import { SidebarService } from '~/components/dashboard/sidebar/sidebar-service'
import type { Session } from '~/lib/auth/auth.server'
import { getAllServiceDashboards } from '~/lib/service/dashboard'
import { DEFAULT_SERVICE } from '~/lib/service/data'

import { SidebarUser } from './sidebar-footer'
import { SidebarPrimary } from './sidebar-primary'
import { SidebarSecondary } from './sidebar-secondary'

export function DashboardSidebar({ user }: { user: Session['user'] }) {
	const matches = useMatches()

	const services = useMemo(
		() => [DEFAULT_SERVICE, ...getAllServiceDashboards()],
		[],
	)

	const currentService = (() => {
		for (const m of [...matches].reverse()) {
			if (!m) continue
			const serviceMatch = services.find(s => s.pathname === m.pathname)
			if (serviceMatch) return serviceMatch
		}
		return DEFAULT_SERVICE
	})()

	if (!currentService) throw new Error('No Service Found (even default one)')

	if (!currentService) throw new Error('No Service Found (even default one)')

	const sidebarPrimaryItems = currentService.sidebar?.primary
	const sidebarSecondaryItems = currentService.sidebar?.secondary

	return (
		<Sidebar variant="inset">
			<title>{`${currentService.name} - Papa CMS`}</title>
			<meta
				name="description"
				content={`Dashboard for ${currentService.name}`}
			/>

			{services && (
				<SidebarHeader>
					<SidebarService services={services} currentService={currentService} />
				</SidebarHeader>
			)}

			{(sidebarPrimaryItems || sidebarSecondaryItems) && (
				<SidebarContent>
					{sidebarPrimaryItems && (
						<SidebarPrimary items={sidebarPrimaryItems} />
					)}
					{sidebarSecondaryItems && (
						<SidebarSecondary
							items={sidebarSecondaryItems}
							className="mt-auto"
						/>
					)}
				</SidebarContent>
			)}

			<SidebarFooter>
				<SidebarUser user={user} />
			</SidebarFooter>
		</Sidebar>
	)
}
