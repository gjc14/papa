import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { useAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Spinner } from '~/components/ui/spinner'
import { CheckboxTree, type TreeNode } from '~/components/checkbox-tree'
import { MultiSelect } from '~/components/multi-select'
import { generateSlug } from '~/lib/utils/seo'
import {
	brandsAtom,
	categoriesAtom,
	productAtom,
	tagsAtom,
} from '~/routes/services/ecommerce/store/product/context'

import type { action as bAction } from '../../03_brands/resource'
import type { loader as bLoader } from '../../03_brands/route'
import type { action as cAction } from '../../04_categories/resource'
import type { loader as cLoader } from '../../04_categories/route'
import type { action as tAction } from '../../05_tags/resource'
import type { loader as tLoader } from '../../05_tags/route'
import { CreateTaxonomyPopover } from './create-taxonomy-popover'

const generateTaxonomy = (name: string) => {
	const slug = generateSlug(name, { fallbackPrefix: 'new classification' })

	return {
		id: -(Math.floor(Math.random() * 2147483648) + 1),
		name: name,
		slug,
		description: '',
		image: null,
		parentId: null,
		children: [],
	}
}

export function Taxonomies() {
	const cFetcher = useFetcher<typeof cLoader>()
	const tFetcher = useFetcher<typeof tLoader>()
	const bFetcher = useFetcher<typeof bLoader>()

	const cCreateFetcher = useFetcher<typeof cAction>()
	const tCreateFetcher = useFetcher<typeof tAction>()
	const bCreateFetcher = useFetcher<typeof bAction>()

	const [product, setProduct] = useAtom(productAtom)
	const [categories, setCategories] = useAtom(categoriesAtom)
	const [tags, setTags] = useAtom(tagsAtom)
	const [brands, setBrands] = useAtom(brandsAtom)

	const topLevelCategories = categories.filter(c => !c.parentId)
	const topLevelBrands = brands.filter(b => !b.parentId)

	const [selectedCIds, setSelectedCIds] = useState<string[]>(
		product ? product.categories.map(c => String(c.id)) : [],
	)
	const [selectedBIds, setSelectedBIds] = useState<string[]>(
		product ? product.brands.map(b => String(b.id)) : [],
	)

	const cTreeData = taxonomiesToTree(categories)
	const bTreeData = taxonomiesToTree(brands)

	const [tPending, setTPending] = useState<typeof tags>([])

	const [dataInitialized, setDataInitialized] = useState({
		tags: false,
		categories: false,
		brands: false,
	})

	useEffect(() => {
		!dataInitialized.categories &&
			cFetcher.load('/dashboard/ecommerce/products/categories')
		!dataInitialized.brands &&
			bFetcher.load('/dashboard/ecommerce/products/brands')

		// Handle taxonomies response
		const cData = cFetcher.data
		const tData = tFetcher.data
		const bData = bFetcher.data

		if (cData && 'categories' in cData) {
			setCategories(cData.categories)
			setDataInitialized(prev => ({ ...prev, categories: true }))
		}

		if (tData && 'tags' in tData) {
			setTags(tData.tags)
			setDataInitialized(prev => ({ ...prev, tags: true }))
		}

		if (bData && 'brands' in bData) {
			setBrands(bData.brands)
			setDataInitialized(prev => ({ ...prev, brands: true }))
		}
	}, [cFetcher.data, tFetcher.data, bFetcher.data])

	// Sync selected categories/brands with product
	useEffect(() => {
		setProduct(prev =>
			prev
				? {
						...prev,
						categories: categories.filter(c =>
							selectedCIds.includes(String(c.id)),
						),
						brands: brands.filter(b => selectedBIds.includes(String(b.id))),
					}
				: prev,
		)
	}, [selectedCIds, selectedBIds])

	// Handle category creation
	useEffect(() => {
		if (
			cCreateFetcher.state === 'loading' &&
			cCreateFetcher.data &&
			'data' in cCreateFetcher.data &&
			cCreateFetcher.data.data
		) {
			const createdCategory = cCreateFetcher.data.data

			setCategories(prev => [...prev, { ...createdCategory, children: [] }])
			setProduct(prev =>
				prev
					? { ...prev, categories: [...prev.categories, createdCategory] }
					: prev,
			)
		}
	}, [cCreateFetcher.state, cCreateFetcher.data])

	// Handle tag creation
	useEffect(() => {
		if (
			tCreateFetcher.state === 'loading' &&
			tCreateFetcher.data &&
			'data' in tCreateFetcher.data &&
			tCreateFetcher.data.data
		) {
			const createdTag = tCreateFetcher.data.data

			setTPending(prev => prev.filter(t => t.slug !== createdTag.slug))
			setTags(prev => [...prev, createdTag])
			setProduct(prev =>
				prev ? { ...prev, tags: [...prev.tags, createdTag] } : prev,
			)
		}
	}, [tCreateFetcher.state, tCreateFetcher.data])

	// Handle brand creation
	useEffect(() => {
		if (
			bCreateFetcher.state === 'loading' &&
			bCreateFetcher.data &&
			'data' in bCreateFetcher.data &&
			bCreateFetcher.data.data
		) {
			const createdBrand = bCreateFetcher.data.data

			setBrands(prev => [...prev, { ...createdBrand, children: [] }])
			setProduct(prev =>
				prev ? { ...prev, brands: [...prev.brands, createdBrand] } : prev,
			)
		}
	}, [bCreateFetcher.state, bCreateFetcher.data])

	// Auto-submit pending items
	useEffect(() => {
		if (tPending.length > 0 && tCreateFetcher.state === 'idle') {
			const [first] = tPending
			tCreateFetcher.submit(
				{ name: first.name, slug: first.slug },
				{
					method: 'post',
					action: '/dashboard/ecommerce/products/tags/resource',
					encType: 'application/json',
				},
			)
		}
	}, [tPending, tCreateFetcher.state])

	const tSelected = product
		? [
				...product.tags.map(t => ({
					label: t.name,
					value: String(t.id),
				})),
				...tPending.map(t => ({
					label: t.name,
					value: t.name,
					className: t.id > 0 ? '' : 'opacity-50',
				})),
			]
		: []

	return (
		<>
			<Card className="gap-4 pt-6 pb-5">
				<CardHeader>
					<CardTitle>Categories</CardTitle>
				</CardHeader>
				<div className="flex w-full items-center justify-center px-5">
					{!product || !dataInitialized.categories ? (
						<Spinner />
					) : cTreeData.length > 0 ? (
						<div className="max-h-52 w-full overflow-auto border">
							<CheckboxTree
								data={cTreeData}
								selectedIds={selectedCIds}
								onSelectionChange={setSelectedCIds}
							/>
						</div>
					) : (
						<div className="text-muted-foreground my-3 rounded-md border border-dashed p-2 text-center text-sm">
							Please add categories to see options
						</div>
					)}
				</div>
				<CardFooter className="w-full">
					<CreateTaxonomyPopover
						taxonomyType="Category"
						parentOptions={topLevelCategories}
						onCreate={data => {
							cCreateFetcher.submit(data, {
								method: 'post',
								action: '/dashboard/ecommerce/products/categories/resource',
								encType: 'application/json',
							})
						}}
						isSubmitting={
							!product ||
							!dataInitialized.categories ||
							cCreateFetcher.state === 'submitting'
						}
					/>
				</CardFooter>
			</Card>
			<Card className="gap-4 pt-6 pb-5">
				<CardHeader>
					<CardTitle>Tags</CardTitle>
				</CardHeader>
				<div className="flex w-full items-center justify-center px-5">
					{!product ? (
						<Spinner />
					) : (
						<MultiSelect
							options={tags.map(t => ({
								label: t.name,
								value: String(t.id),
							}))}
							selected={tSelected}
							onSelectedChange={areSelected => {
								const { existing, notExisting } = areSelected.reduce(
									(acc, selected) => {
										const found = tags.find(
											t => String(t.id) === selected.value,
										)
										if (found) {
											acc.existing.push(found)
										} else {
											acc.notExisting.push(generateTaxonomy(selected.label))
										}
										return acc
									},
									{
										existing: [] as typeof tags,
										notExisting: [] as typeof tags,
									},
								)

								setProduct(prev => (prev ? { ...prev, tags: existing } : prev))
								setTPending(notExisting)
							}}
							onInitSearch={() =>
								!dataInitialized.tags &&
								tFetcher.load('/dashboard/ecommerce/products/tags')
							}
							isSearching={!dataInitialized.tags}
						/>
					)}
				</div>
			</Card>
			<Card className="gap-4 pt-6 pb-5">
				<CardHeader>
					<CardTitle>Brands</CardTitle>
				</CardHeader>
				<div className="flex w-full items-center justify-center px-5">
					{!product || !dataInitialized.brands ? (
						<Spinner />
					) : bTreeData.length > 0 ? (
						<div className="max-h-52 w-full overflow-auto border">
							<CheckboxTree
								data={bTreeData}
								selectedIds={selectedBIds}
								onSelectionChange={setSelectedBIds}
							/>
						</div>
					) : (
						<div className="text-muted-foreground my-3 rounded-md border border-dashed p-2 text-center text-sm">
							Please add brands to see options
						</div>
					)}
				</div>
				<CardFooter className="w-full">
					<CreateTaxonomyPopover
						taxonomyType="Brand"
						parentOptions={topLevelBrands}
						onCreate={data => {
							bCreateFetcher.submit(data, {
								method: 'post',
								action: '/dashboard/ecommerce/products/brands/resource',
								encType: 'application/json',
							})
						}}
						isSubmitting={
							!product ||
							!dataInitialized.brands ||
							bCreateFetcher.state === 'submitting'
						}
					/>
				</CardFooter>
			</Card>
		</>
	)
}

// util
type Taxonomy =
	| ReturnType<typeof categoriesAtom.read>[number]
	| ReturnType<typeof brandsAtom.read>[number]

/**
 * Transform a flat array into a tree structure
 */
function taxonomiesToTree(tmies: Taxonomy[]): TreeNode[] {
	const tmyMap = new Map<number, Taxonomy>()
	const rootTaxonomies: Taxonomy[] = []

	// Create tmy map
	tmies.forEach(tmy => {
		tmyMap.set(tmy.id, tmy)
	})

	// Find root (no parent) taxonomies
	tmies.forEach(tmy => {
		if (tmy.parentId === null) {
			rootTaxonomies.push(tmy)
		}
	})

	// Recursively build tree structure
	function buildTree(tmy: Taxonomy): TreeNode {
		const children = tmies
			.filter(t => t.parentId === tmy.id)
			.map(child => buildTree(child))

		return {
			id: String(tmy.id),
			label: tmy.name,
			children: children.length > 0 ? children : undefined,
		}
	}

	return rootTaxonomies.map(rootTmy => buildTree(rootTmy))
}
