import {
	Building,
	Cloud,
	LifeBuoy,
	Send,
	TextSearch,
	UserCog2,
	UserRound,
} from 'lucide-react'

import type { ServiceDashboard } from '~/lib/service/type'

// Default services and navigation items
export const DEFAULT_SERVICE: ServiceDashboard = {
	name: 'Papa',
	logo: '/papa-logo-100.png',
	pathname: '/dashboard',
	sidebar: {
		primary: [
			{ icon: UserRound, title: 'Users', pathname: 'users' },
			{ icon: Cloud, title: 'Assets', pathname: 'assets' },
			{ icon: TextSearch, title: 'SEO', pathname: 'seo' },
		],
		secondary: [
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
		],
	},
}
