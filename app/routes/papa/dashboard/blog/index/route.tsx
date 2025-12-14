import type { Route } from './+types/route'
import { useEffect, useRef, useState } from 'react'
import { data, Link, useFetcher } from 'react-router'

import type { Table } from '@tanstack/react-table'
import { PlusCircle } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useFetcherNotification } from '~/hooks/use-notification'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { DashboardDataTable } from '../../components/dashboard-data-table'
import { useSkipper } from '../../components/dashboard-data-table/hooks'
import type { action } from '../resource'
import { BulkDeleteAlertDialog } from './bulk-delete'
import { fetchPosts, headers, postsServerMemoryCache, TTL } from './cache'
import { columns } from './colums'
import { Filter } from './filters'

export const meta = () => {
	return [{ name: 'title', content: 'Dashboard Blog' }]
}

/**
 * @link [web blog index route](../../../../web/blog/index/route.tsx)
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
	const { categoryFilter, tagFilter, q } = loaderData
	const fetcher = useFetcher<typeof action>()
	const { mutating } = useFetcherNotification(fetcher)

	const tableRef = useRef<Table<(typeof loaderData.posts)[0]>>(null)
	const [shouldSkip, skip] = useSkipper()
	const [state, setState] = useState(loaderData.posts)

	useEffect(() => {
		skip()
		setState(loaderData.posts)
	}, [loaderData])

	useEffect(() => {
		if (!mutating && fetcher.data && 'msg' in fetcher.data) {
			// // Clear selection after successful delete
			// setRowSelection({})
			// // Remove deleted rows from deleting state
			// setRowsDeleting(prev => {
			// 	const newSet = new Set(prev)
			// 	Object.keys(rowSelection).forEach(id => newSet.delete(id))
			// 	return newSet
			// })
		}
	}, [fetcher.state])

	const handleBulkDelete = async () => {
		// // Display deleting state
		// setRowsDeleting(prev => {
		// 	const newSet = new Set(prev)
		// 	Object.keys(rowSelection).forEach(id => newSet.add(id))
		// 	return newSet
		// })
		// // Get post ids
		// const postIds = Object.keys(rowSelection).map(rawId => {
		// 	if (Number.isNaN(rawId)) console.warn('Invalid rawId:', rawId)
		// 	const postId = posts[Number(rawId)].id
		// 	if (!postId) console.warn('Post not found for rowId:', Number(rawId))
		// 	return postId
		// })
		// // Submit bulk delete request
		// fetcher.submit(
		// 	{ ids: postIds },
		// 	{
		// 		method: 'DELETE',
		// 		action: `/dashboard/blog/resource`,
		// 		encType: 'application/json',
		// 	},
		// )
	}

	return (
		<DashboardLayout className="gap-2">
			<DashboardHeader>
				<DashboardTitle title="Posts"></DashboardTitle>
				<DashboardActions>
					{/* {numberOfRowsSelected > 0 && (
						<BulkDeleteAlertDialog
							numberOfRowsDeleting={numberOfRowsSelected}
							onDelete={handleBulkDelete}
							isDeleting={mutating}
						/>
					)} */}
					<Filter q={q} tagFilter={tagFilter} categoryFilter={categoryFilter} />
					<Button size={'sm'} asChild>
						<Link to="/dashboard/blog/new">
							<PlusCircle size={16} />
							<p className="text-xs">Create new post</p>
						</Link>
					</Button>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent className="px-0 md:px-0">
				<DashboardDataTable
					columns={columns}
					data={state}
					setData={setState}
					ref={tableRef}
					autoResetPageIndex={shouldSkip}
					skipAutoResetPageIndex={skip}
					className="px-2 md:px-3"
					initialPageSize={20}
				/>
			</DashboardContent>
		</DashboardLayout>
	)
}
