import {
	PenIcon,
	PlusIcon,
	RssIcon,
	TreeStructureIcon,
} from '@phosphor-icons/react'

import { registerServiceDashboard } from '~/lib/service/dashboard-registry'

registerServiceDashboard({
	name: 'Blog',
	description: 'Write and manage your blog posts with ease!',
	logo: RssIcon,
	pathname: '/dashboard/blog',
	sidebar: {
		primary: [
			{ icon: PenIcon, title: 'Posts', pathname: 'blog' },
			{ icon: PlusIcon, title: 'Create Post', pathname: 'blog/new' },
			{
				icon: TreeStructureIcon,
				title: 'Categories / Tags',
				pathname: 'blog/taxonomy',
			},
		],
	},
})
