import { List, Pen, Plus, Rss } from 'lucide-react'

import { registerServiceDashboard } from '~/lib/service/dashboard-registry'

registerServiceDashboard({
	name: 'Blog',
	description: 'Write and manage your blog posts with ease!',
	logo: Rss,
	pathname: '/dashboard/blog',
	sidebar: {
		primary: [
			{ icon: Pen, title: 'Posts', pathname: 'blog' },
			{ icon: Plus, title: 'Create Post', pathname: 'blog/new' },
			{ icon: List, title: 'Categories / Tags', pathname: 'blog/taxonomy' },
		],
	},
})
