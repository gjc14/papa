import type { Route } from './+types/route'
import { Link } from 'react-router'

import { Badge } from '~/components/ui/badge'

import { PostCollection } from '../components/posts'

export default function Index({ matches }: Route.ComponentProps) {
	const { meta, posts, categoriesFilter, tagsFilter } = matches[2].data

	const isCategoryFiltering = categoriesFilter && categoriesFilter.length > 0
	const isTagFiltering = tagsFilter && tagsFilter.length > 0

	const categoryFilters = isCategoryFiltering ? (
		<span className="space-x-1">
			category:{' '}
			{categoriesFilter.map(cat => (
				<Badge
					key={cat.id}
					className="border-primary bg-brand text-brand-foreground rounded-full"
				>
					{cat.name}
				</Badge>
			))}
		</span>
	) : undefined

	const tagFilters = isTagFiltering ? (
		<span className="space-x-1">
			tag:{' '}
			{tagsFilter.map(tag => (
				<Badge
					key={tag.id}
					className="border-primary bg-brand text-brand-foreground rounded-full"
				>
					{tag.name}
				</Badge>
			))}
		</span>
	) : undefined

	let description: React.ReactNode = undefined

	if (categoryFilters && tagFilters) {
		description = (
			<>
				{categoryFilters}
				{tagFilters}
			</>
		)
	} else if (categoryFilters) {
		description = <>{categoryFilters}</>
	} else if (tagFilters) {
		description = <>{tagFilters}</>
	}

	return (
		<>
			<h1 className="visually-hidden">{meta?.seo.metaTitle}</h1>

			<PostCollection title={'Blog.'} posts={posts} description={description} />
		</>
	)
}
