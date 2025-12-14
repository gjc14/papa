import { List, Pen, Plus, Rss } from 'lucide-react'

import type { Service } from '../../papa/utils/service-configs'

export const config = {
	dashboard: {
		name: 'Blog',
		description: 'Write and manage your blog posts with ease!',
		logo: Rss,
		pathname: '/dashboard/blog',
		sidebar: [
			{ icon: Pen, title: 'Posts', pathname: 'blog' },
			{ icon: Plus, title: 'Create Post', pathname: 'blog/new' },
			{ icon: List, title: 'Categories / Tags', pathname: 'blog/taxonomy' },
		],
		routes: ({ route, index, prefix }) => [
			route('blog', './routes/services/blog/dashboard/layout.tsx', [
				index('./routes/services/blog/dashboard/index/route.tsx'),
				route(
					':postSlug',
					'./routes/services/blog/dashboard/post-slug/route.tsx',
				),
				route('resource', './routes/services/blog/dashboard/resource.ts'),
				...prefix('taxonomy', [
					index('./routes/services/blog/dashboard/taxonomy/index.tsx'),
					route(
						'resource',
						'./routes/services/blog/dashboard/taxonomy/resource.ts',
					),
				]),
			]),
		],
	},
	routes: ({ route, index }) => [
		route('/blog', './routes/services/blog/web/layout.tsx', [
			index('./routes/services/blog/web/index/route.tsx'),
			route(':postSlug', './routes/services/blog/web/post-slug/route.tsx'),
			route(
				':postSlug/edit',
				'./routes/services/blog/web/post-slug-edit/route.tsx',
			),
			route('subscribe', './routes/services/blog/web/subscribe/route.tsx'),
		]),
	],
	sitemap: url => [
		{
			loc: `${url.origin}/store`,
			lastmod: new Date(),
			changefreq: 'daily',
			priority: 0.8,
		},
		{
			loc: '/store/123',
			lastmod: new Date(),
			changefreq: 'weekly',
			priority: 0.5,
		},
	],
} satisfies Service
