import { getSeo } from '~/lib/db/seo.server'
import { createMeta } from '~/lib/utils/seo'

import { getPosts } from '../../lib/db/post.server'

type PostPromise = ReturnType<typeof fetchPosts> // Promise<{ meta, post, ... }>
type PostPayload = Awaited<PostPromise> // { meta, post, ... }

type CacheEntry = {
	data?: PostPayload
	expiresAt: number
	promise?: PostPromise
}

export const postsServerMemoryCache = new Map<string, CacheEntry>()
export const TTL = 60 * 1000 // 60s
export const headers = {
	'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=30',
}

export async function fetchPosts(
	url: URL,
	categories?: string[],
	tags?: string[],
	q?: string,
) {
	const seo = await getSeo(url.pathname)
	const meta = seo ? createMeta(seo, url) : null

	const { posts, categoryFilter, tagFilter } = await getPosts({
		status: 'PUBLISHED',
		categories,
		tags,
		title: q,
	})
	cleanupExpiredEntries()

	return { meta, posts, categoryFilter, tagFilter, q }
}

function cleanupExpiredEntries() {
	const now = Date.now()
	for (const [key, entry] of postsServerMemoryCache.entries()) {
		if (entry.expiresAt <= now) {
			postsServerMemoryCache.delete(key)
		}
	}
}
