import type { Route } from './+types/route'
import { data } from 'react-router'

import { Badge } from '~/components/ui/badge'

import { PostCollection } from '../components/posts'
import { fetchPosts, headers, postsServerMemoryCache, TTL } from './cache'

export const loader = async ({ request }: Route.LoaderArgs) => {
	const url = new URL(request.url)
	const { searchParams } = url
	const categories = searchParams.get('category')?.split(',')
	const tags = searchParams.get('tag')?.split(',')
	const q = searchParams.get('q') || undefined

	const cacheKey = searchParams.toString()
	const now = Date.now()
	const entry = postsServerMemoryCache.get(cacheKey)

	// cache hit
	if (entry && entry.data && entry.expiresAt > now) {
		return data(entry.data, { headers })
	}

	// inflight dedupe
	if (entry?.promise) {
		const payload = await entry.promise
		return data(payload, { headers })
	}

	// cache miss
	const promise = fetchPosts(url, categories, tags, q)
	postsServerMemoryCache.set(cacheKey, { expiresAt: 0, promise })

	const payload = await promise
	postsServerMemoryCache.set(cacheKey, {
		data: payload,
		expiresAt: Date.now() + TTL,
	})

	return data(payload, { headers })
}

export default function Index({ loaderData }: Route.ComponentProps) {
	const { meta, posts, categoryFilter, tagFilter, q } = loaderData

	const isCategoryFiltering = categoryFilter && categoryFilter.length > 0
	const isTagFiltering = tagFilter && tagFilter.length > 0

	const categoryFilters = isCategoryFiltering ? (
		<span className="space-x-1">
			category:{' '}
			{categoryFilter.map(cat => (
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
			{tagFilter.map(tag => (
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
			{meta?.metaTags.map((t, i) =>
				t.title ? <title key={i}>{t.title}</title> : <meta key={i} {...t} />,
			)}
			<h1 className="visually-hidden">{meta?.seo.metaTitle}</h1>

			<PostCollection
				title={'Blog.'}
				posts={posts}
				description={description}
				q={q}
			/>
		</>
	)
}
