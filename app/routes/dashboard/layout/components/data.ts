import {
	Building,
	Cloud,
	LifeBuoy,
	Send,
	TextSearch,
	UserCog2,
	UserRound,
} from 'lucide-react'

import type { ServiceDashboardConfig } from '~/components/dashboard/service-swicher'
import type { DashboardMenuItem } from '~/components/dashboard/sidebar/nav-menu'
import type { NavSecondaryItem } from '~/components/dashboard/sidebar/nav-secondary'

// Default services and navigation items
export const DEFAULT_SERVICE: ServiceDashboardConfig = {
	name: 'Papa',
	logo: '/papa-logo-100.png',
	pathname: '/dashboard',
}

export const DEFAULT_MAIN_NAV_ITEMS: DashboardMenuItem[] = [
	{ icon: UserRound, title: 'Users', pathname: 'users' },
	{ icon: Cloud, title: 'Assets', pathname: 'assets' },
	{ icon: TextSearch, title: 'SEO', pathname: 'seo' },
]

export const DEFAULT_SECONDARY_NAV_ITEMS: NavSecondaryItem[] = [
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
		url: '/dashboard/company',
		icon: Building,
	},
	{
		title: 'Admins',
		url: '/dashboard/admins',
		icon: UserCog2,
	},
]
