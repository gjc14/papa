import type { Route } from './+types/layout'
import { Outlet } from 'react-router'

import { MainWrapper } from '~/components/wrappers'
import { getPostBySlug, getPosts } from '~/lib/db/post.server'
import { getSEO } from '~/lib/db/seo.server'
import { createMeta } from '~/lib/utils/seo'
import { validateAdminSession } from '~/routes/papa/auth/utils'

import { CTA } from './components/cta'
import { Footer } from './components/footer'
import { Nav } from './components/nav'

export const meta = ({ data, location }: Route.MetaArgs) => {
	if (!data || !data.meta) {
		if (location.pathname !== '/blog') {
			return [{ name: 'title', content: 'Post - Not Found' }]
		}
		return []
	}

	return data.meta.metaTags
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const url = new URL(request.url)

	const { seo } = await getSEO(url.pathname) // /blog or /blog/:slug
	const meta = seo ? createMeta(seo, url) : null

	const { searchParams } = url
	const preview = searchParams.get('preview') === 'true'
	if (preview) {
		validateAdminSession(request)
	}

	const { postSlug } = params

	const categories = url.searchParams.get('category')?.split(',')
	const tags = url.searchParams.get('tag')?.split(',')

	if (postSlug) {
		// Enter directly to a post
		const { post } = await getPostBySlug(
			postSlug,
			preview ? 'DRAFT' : 'PUBLISHED',
		)
		return {
			searchParams: searchParams.toString(),
			meta,
			posts: post ? [post] : [],
		}
	} else {
		const { posts, categoriesFilter, tagsFilter } = await getPosts({
			status: 'PUBLISHED',
			categoriesFilter: categories,
			tagsFilter: tags,
		})
		return {
			searchParams: searchParams.toString(),
			meta,
			posts,
			categoriesFilter,
			tagsFilter,
		}
	}
}

let cache: Awaited<ReturnType<typeof loader>>
export const clientLoader = async ({
	request,
	serverLoader,
}: Route.ClientLoaderArgs) => {
	if (cache) {
		if (cache.searchParams === new URL(request.url).searchParams.toString()) {
			return cache
		}
	}

	cache = await serverLoader()
	return cache
}

clientLoader.hydrate = true

export default function Blog() {
	return (
		<main className="flex min-h-svh w-full flex-1 flex-col">
			<Nav />
			<Outlet />
			<CTA />
			<Footer />
		</main>
	)
}
