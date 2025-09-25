import type { Route } from './+types'
import { useMemo, useState } from 'react'

import { useAtom } from 'jotai'

import { Button } from '~/components/ui/button'
import { getPosts } from '~/lib/db/post.server'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardSectionWrapper,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { categoriesAtom, tagsAtom } from '../context'
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

export const loader = async () => {
	return await getPosts({ status: 'ALL' })
}

// Main Component
export default function DashboardTaxonomy({
	loaderData: { posts: postsLoader },
}: Route.ComponentProps) {
	const [tagsContext] = useAtom(tagsAtom)
	const [categoriesContext] = useAtom(categoriesAtom)

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
			...tagsContext.map(tag => {
				return {
					...tag,
					posts: postsLoader.filter(post =>
						(post.tags ?? []).map(t => t.id).includes(tag.id),
					),
				}
			}),
			...pendingTags.filter(
				pendingTag => !tagsContext.some(tag => tag.slug === pendingTag.slug),
			),
		],
		[tagsContext, postsLoader, pendingTags],
	)

	const categories: (CategoryType & { _isPending?: true })[] = useMemo(
		() => [
			...categoriesContext.map(category => {
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
						(post.categories ?? []).map(c => c.id).includes(category.id),
					),
				}
			}),
			...pendingCategories.filter(
				pendingCategory =>
					!categoriesContext.some(
						category => category.slug === pendingCategory.slug,
					),
			),
		],
		[categoriesContext, postsLoader, pendingChildCategories, pendingCategories],
	)

	const selectedCategory = useMemo(
		() =>
			categories.find(category => category.id === selectedCategoryId) ?? null,
		[categories, selectedCategoryId],
	)

	// Panel for mobile to show selected taxonomy
	const [activePanel, setActivePanel] = useState<
		'tags' | 'categories' | 'hierarchy'
	>('tags')

	return (
		<DashboardSectionWrapper>
			<DashboardHeader>
				<DashboardTitle
					title="Taxonomy"
					description="SEO data is connect to post or route. You could set in either here or in post or route."
				></DashboardTitle>
				<DashboardActions></DashboardActions>
			</DashboardHeader>

			<DashboardContent className="hidden gap-6 lg:grid lg:grid-cols-3 lg:grid-rows-1">
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

			<DashboardContent className="flex min-h-0 flex-1 flex-col gap-3 lg:hidden">
				{/* Tabs */}
				<div className="border-primary/20 grid h-fit w-full grid-cols-3 rounded-full border p-1">
					<Button
						variant={activePanel === 'tags' ? 'default' : 'ghost'}
						size={'sm'}
						onClick={() => setActivePanel('tags')}
						aria-pressed={activePanel === 'tags'}
						className="rounded-full"
					>
						<span className="truncate">Tags</span>
					</Button>
					<Button
						variant={activePanel === 'categories' ? 'default' : 'ghost'}
						size={'sm'}
						onClick={() => setActivePanel('categories')}
						aria-pressed={activePanel === 'categories'}
						className="rounded-full"
					>
						<span className="truncate">Categories</span>
					</Button>
					<Button
						variant={activePanel === 'hierarchy' ? 'default' : 'ghost'}
						size={'sm'}
						onClick={() => setActivePanel('hierarchy')}
						aria-pressed={activePanel === 'hierarchy'}
						className="rounded-full"
					>
						<span className="truncate">Subcategories</span>
					</Button>
				</div>

				{/* Panels */}
				{activePanel === 'tags' && <TagsSection tags={tags} />}

				{activePanel === 'categories' && (
					<CategoriesSection
						categories={categories.filter(c => !c.parentId)}
						selectedCategoryId={selectedCategoryId}
						setSelectedCategoryId={setSelectedCategoryId}
					/>
				)}

				{activePanel === 'hierarchy' && (
					<CategoryHierarchySection category={selectedCategory} />
				)}
			</DashboardContent>
		</DashboardSectionWrapper>
	)
}
