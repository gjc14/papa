import type { Route } from './+types/route'
import { useEffect, useMemo, useState } from 'react'
import { data, Link, useFetcher } from 'react-router'

import { PlusCircle } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useFetcherNotification } from '~/hooks/use-notification'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardSectionWrapper,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'
import { DataTable } from '~/routes/papa/dashboard/components/data-table'

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
	const { posts, categoryFilter, tagFilter, q } = loaderData
	const fetcher = useFetcher<typeof action>()
	const { mutating } = useFetcherNotification(fetcher, { alertWhen: 'idle' })

	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
	const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())

	const numberOfRowsSelected = Object.keys(rowSelection).length

	const tableData = useMemo(() => {
		return posts.map(p => {
			return { ...p, setRowsDeleting }
		})
	}, [posts])

	useEffect(() => {
		if (!mutating && fetcher.data && 'msg' in fetcher.data) {
			// Clear selection after successful delete
			setRowSelection({})
			// Remove deleted rows from deleting state
			setRowsDeleting(prev => {
				const newSet = new Set(prev)
				Object.keys(rowSelection).forEach(id => newSet.delete(id))
				return newSet
			})
		}
	}, [fetcher.state])

	const handleBulkDelete = async () => {
		// Display deleting state
		setRowsDeleting(prev => {
			const newSet = new Set(prev)
			Object.keys(rowSelection).forEach(id => newSet.add(id))
			return newSet
		})

		// Get post ids
		const postIds = Object.keys(rowSelection).map(rawId => {
			if (Number.isNaN(rawId)) console.warn('Invalid rawId:', rawId)
			const postId = posts[Number(rawId)].id
			if (!postId) console.warn('Post not found for rowId:', Number(rawId))
			return postId
		})

		// Submit bulk delete request
		fetcher.submit(
			{ ids: postIds },
			{
				method: 'DELETE',
				action: `/dashboard/blog/resource`,
				encType: 'application/json',
			},
		)
	}

	return (
		<DashboardSectionWrapper className="gap-2">
			<DashboardHeader>
				<DashboardTitle title="Posts"></DashboardTitle>
				<DashboardActions>
					{numberOfRowsSelected > 0 && (
						<BulkDeleteAlertDialog
							numberOfRowsDeleting={numberOfRowsSelected}
							onDelete={handleBulkDelete}
							isDeleting={mutating}
						/>
					)}
					<Filter q={q} tagFilter={tagFilter} categoryFilter={categoryFilter} />
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
