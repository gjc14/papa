import * as React from 'react'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from '~/components/ui/sidebar'
import {
	SidebarService,
	type ServiceDashboardConfig,
} from '~/components/dashboard/sidebar/sidebar-service'
import type { Session } from '~/lib/auth/auth.server'

import { SidebarUser } from './sidebar-footer'
import { SidebarPrimary, type SidebarPrimaryItem } from './sidebar-primary'
import {
	SidebarSecondary,
	type SidebarSecondaryItem,
} from './sidebar-secondary'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	user: Session['user']
	services?: ServiceDashboardConfig[]
	currentService?: ServiceDashboardConfig
	sidebarPrimaryItems?: SidebarPrimaryItem[]
	sidebarSecondaryItems?: SidebarSecondaryItem[]
}

export function DashboardSidebar({
	user,
	services,
	currentService,
	sidebarPrimaryItems,
	sidebarSecondaryItems,
	...props
}: AppSidebarProps) {
	return (
		<Sidebar variant="inset" {...props}>
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
