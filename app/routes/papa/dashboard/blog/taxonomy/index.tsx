import type { Route } from './+types'
import { useMemo, useState } from 'react'

import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardSectionWrapper,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import {
	CategoriesSection,
	CategoryHierarchySection,
} from './components/category'
import { TagsSection } from './components/tag'
import type { CategoryType, TagType } from './type'
import {
	usePendingCategories,
	usePendingChildCategories,
	usePendingTags,
} from './utils'

export const actionRoute = '/dashboard/blog/taxonomy/resource'

// Main Component
export default function DashboardTaxonomy({ matches }: Route.ComponentProps) {
	const match = matches[2]
	const {
		tags: tagsLoader,
		categories: categoriesLoader,
		posts: postsLoader,
	} = match.data

	const pendingTags: (TagType & { _isPending: true })[] = usePendingTags().map(
		p => ({ ...p, _isPending: true }),
	)
	const pendingCategories: (CategoryType & { _isPending: true })[] =
		usePendingCategories().map(p => ({ ...p, _isPending: true }))
	const pendingChildCategories: (CategoryType & { _isPending: true })[] =
		usePendingChildCategories().map(p => ({ ...p, _isPending: true }))

	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
		null,
	)

	const tags: (TagType & { _isPending?: true })[] = useMemo(
		() => [
			...tagsLoader.map(tag => {
				return {
					...tag,
					posts: postsLoader.filter(post =>
						post.tags.map(t => t.id).includes(tag.id),
					),
				}
			}),
			...pendingTags.filter(
				pendingTag => !tagsLoader.some(tag => tag.slug === pendingTag.slug),
			),
		],
		[tagsLoader, postsLoader, pendingTags],
	)

	const categories: (CategoryType & { _isPending?: true })[] = useMemo(
		() => [
			...categoriesLoader.map(category => {
				const thisPendingChildren = pendingChildCategories.filter(
					pendingChild => pendingChild.parentId === category.id,
				)
				return {
					...category,
					children: [
						...category.children,
						...thisPendingChildren.filter(
							p => !category.children.some(child => child.slug === p.slug),
						),
					],
					posts: postsLoader.filter(post =>
						post.categories.map(c => c.id).includes(category.id),
					),
				}
			}),
			...pendingCategories.filter(
				pendingCategory =>
					!categoriesLoader.some(
						category => category.slug === pendingCategory.slug,
					),
			),
		],
		[categoriesLoader, postsLoader, pendingChildCategories, pendingCategories],
	)

	const selectedCategory = useMemo(
		() =>
			categories.find(category => category.id === selectedCategoryId) ?? null,
		[categories, selectedCategoryId],
	)

	return (
		<DashboardSectionWrapper>
			<DashboardHeader>
				<DashboardTitle
					title="Taxonomy"
					description="SEO data is connect to post or route. You could set in either here or in post or route."
				></DashboardTitle>
				<DashboardActions></DashboardActions>
			</DashboardHeader>

			<DashboardContent className="grid grid-cols-1 grid-rows-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{/* Tags Section (Left) */}
				<TagsSection tags={tags} />

				{/* Categories Section (Middle) */}
				<CategoriesSection
					categories={categories.filter(c => !c.parentId)}
					selectedCategoryId={selectedCategoryId}
					setSelectedCategoryId={setSelectedCategoryId}
				/>

				{/* Category Hierarchy Section (Right) */}
				<CategoryHierarchySection category={selectedCategory} />
			</DashboardContent>
		</DashboardSectionWrapper>
	)
}
