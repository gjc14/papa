import type { Route } from './+types/layout'
import { useEffect } from 'react'
import { Outlet } from 'react-router'

import { Provider, useAtom } from 'jotai'

import type { Category, Tag } from '../lib/db/schema'
import { getCategories, getTags } from '../lib/db/taxonomy.server'
import { categoriesAtom, tagsAtom } from './context'

export const loader = async () => {
	const tagsPromise = getTags()
	const categoriesPromise = getCategories()
	return { tagsPromise, categoriesPromise }
}

export default function DashboardBlog({ loaderData }: Route.ComponentProps) {
	const { tagsPromise, categoriesPromise } = loaderData

	return (
		<Provider>
			<TaxonomiesLoader
				tagsPromise={tagsPromise}
				categoriesPromise={categoriesPromise}
			/>
			<Outlet />
		</Provider>
	)
}

function TaxonomiesLoader({
	tagsPromise,
	categoriesPromise,
}: {
	tagsPromise: Promise<{ tags: Tag[] }>
	categoriesPromise: Promise<{
		categories: (Category & { children: Category[] })[]
	}>
}) {
	const [, setTags] = useAtom(tagsAtom)
	const [, setCategories] = useAtom(categoriesAtom)

	useEffect(() => {
		// Set taxonomies when promises resolve
		const loadTaxonomies = async () => {
			try {
				const { tags } = await tagsPromise
				const { categories } = await categoriesPromise

				setTags(tags)
				setCategories(categories)
			} catch (error) {
				console.error('Failed to load taxonomies:', error)
			}
		}

		loadTaxonomies()
	}, [tagsPromise, categoriesPromise])

	return null
}
