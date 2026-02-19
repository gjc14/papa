import { getSeo } from '~/lib/db/seo.server'
import { createMeta } from '~/lib/utils/seo'

import { getPostBySlug } from '../../lib/db/post.server'

type PostPromise = ReturnType<typeof fetchPost> // Promise<{ meta, post, ... }>
type PostPayload = Awaited<PostPromise> // { meta, post, ... }

type CacheEntry = {
	data?: PostPayload
	expiresAt: number
	promise?: PostPromise
}

export const postServerMemoryCache = new Map<string, CacheEntry>()
export const TTL = 60 * 1000 // 60s
export const headers = {
	'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=30',
}

export async function fetchPost(postSlug: string, url: URL) {
	const seo = await getSeo(url.pathname)
	const meta = seo ? createMeta(seo, url) : null

	const { post, nextPost, prevPost } = await getPostBySlug(
		postSlug,
		'PUBLISHED',
	)
	cleanupExpiredEntries()

	return { meta, post, nextPost, prevPost }
}

function cleanupExpiredEntries() {
	const now = Date.now()
	for (const [key, entry] of postServerMemoryCache.entries()) {
		if (entry.expiresAt <= now) {
			postServerMemoryCache.delete(key)
		}
	}
}
