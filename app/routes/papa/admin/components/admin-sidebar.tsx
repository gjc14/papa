import * as React from 'react'

import { Building, Command, LifeBuoy, Send, UserCog2 } from 'lucide-react'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from '~/components/ui/sidebar'
import type { Session } from '~/lib/auth/auth.server'
import { NavMain } from '~/routes/papa/admin/components/nav/nav-main'
import { NavPlugins } from '~/routes/papa/admin/components/nav/nav-plugins'
import {
	NavSecondary,
	type NavSecondaryItem,
} from '~/routes/papa/admin/components/nav/nav-secondary'
import { NavUser } from '~/routes/papa/admin/components/nav/nav-user'
import type { PapaAdminMenuItem } from '~/routes/plugins/utils/get-plugin-configs.server'

import { ServiceSwicher, type ServiceSwicherProps } from './service-swicher'

const services: ServiceSwicherProps['services'] = [
	{
		name: 'Papa',
		logo: () => <Command className="size-4" />,
		plan: 'Startup',
		url: '/admin',
	},
]

const MainNavItems: PapaAdminMenuItem[] = [
	{
		iconName: 'user-round',
		title: 'Users',
		url: '/admin/users',
	},
	{
		iconName: 'pen',
		title: 'Blog',
		url: '/admin/blog',
		sub: [{ title: 'Categories / Tags', url: 'taxonomy' }],
	},
	{ iconName: 'text-search', title: 'SEO', url: '/admin/seo' },
	{ iconName: 'cloud', title: 'Assets', url: '/admin/assets' },
	{ iconName: 'at-sign', title: 'Email Campaign', url: '/admin/campaign' },
]

const SecondaryNavItems: NavSecondaryItem[] = [
	{
		title: 'Support',
		action: () => {
			alert('Support')
		},
		icon: LifeBuoy,
	},
	{
		title: 'Feedback',
		action: () => {
			alert('Feedback')
		},
		icon: Send,
	},
	{
		title: 'Company',
		url: '/admin/company',
		icon: Building,
	},
	{
		title: 'Admins',
		url: '/admin/admins',
		icon: UserCog2,
	},
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	pluginRoutes: PapaAdminMenuItem[]
	user: Session['user']
}

export function AdminSidebar({
	user,
	pluginRoutes,
	...props
}: AppSidebarProps) {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<ServiceSwicher services={services} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={MainNavItems} />
				<NavPlugins plugins={pluginRoutes} />
				<NavSecondary items={SecondaryNavItems} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	)
}
