import type { Route } from './+types/route'
import { useEffect, useMemo, useState } from 'react'
import { data, Link, useNavigation } from 'react-router'

import { useAtom } from 'jotai'
import { PlusCircle } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Loading } from '~/components/loading'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardSectionWrapper,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'
import { DataTable } from '~/routes/papa/dashboard/components/data-table'

import { categoriesAtom, tagsAtom } from '../context'
import { fetchPosts, headers, postsServerMemoryCache, TTL } from './cache'
import { columns } from './colums'
import { Filter } from './filters'
import { Search } from './search'

export const meta = () => {
	return [{ name: 'title', content: 'Dashboard Blog' }]
}

/**
 * @see file [web blog index route.tsx](../../../../web/blog/index/route.tsx)
 */
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

export default function DashboardPost({ loaderData }: Route.ComponentProps) {
	const { posts, categoriesFilter, tagsFilter, q } = loaderData

	const navigation = useNavigation()

	const params = new URLSearchParams(navigation.location?.search || '')
	const searching = ['q', 'tag', 'category'].some(k => params.has(k))

	const isNavigating = navigation.state === 'loading' && !searching

	const [rowSelection, setRowSelection] = useState({})
	const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())

	useEffect(() => {
		console.log('rowSelection', rowSelection)
	}, [rowSelection, rowsDeleting])

	const tableData = useMemo(() => {
		return posts.map(p => {
			return { ...p, setRowsDeleting }
		})
	}, [posts])

	if (isNavigating) {
		return (
			<div className="mx-auto flex h-full flex-1 flex-col items-center justify-center space-y-6">
				<Loading />
			</div>
		)
	}

	return (
		<DashboardSectionWrapper className="gap-2">
			<DashboardHeader>
				<DashboardTitle title="Posts"></DashboardTitle>
				<DashboardActions>
					<Filter
						q={q}
						tagsFilter={tagsFilter}
						categoryFilter={categoriesFilter}
						searching={searching}
					/>
					<Button size={'sm'} asChild>
						<Link to="/dashboard/blog/new">
							<PlusCircle size={16} />
							<p className="text-xs">Create new post</p>
						</Link>
					</Button>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent>
				<DataTable
					columns={columns}
					data={tableData}
					hideColumnFilter
					rowSelection={rowSelection}
					setRowSelection={setRowSelection}
					rowGroupStyle={[
						{
							rowIds: rowsDeleting,
							className: 'opacity-50 pointer-events-none',
						},
					]}
				/>
			</DashboardContent>
		</DashboardSectionWrapper>
	)
}
