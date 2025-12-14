/**
 * Contains the taxonomy (categories and tags) part of the post editor
 */

import { useAtom } from 'jotai'

import { Label } from '~/components/ui/label'
import { Spinner } from '~/components/ui/spinner'
import { MultiSelect } from '~/components/multi-select'

import { categoriesAtom, editorAtom, postAtom, tagsAtom } from '../../context'
import { generateNewCategory } from '../../taxonomy/components/category'
import { generateNewTag } from '../../taxonomy/components/tag'

export const TaxonomyPart = () => {
	const [post, setPost] = useAtom(postAtom)
	const [editor] = useAtom(editorAtom)
	const [tags] = useAtom(tagsAtom)
	const [categories] = useAtom(categoriesAtom)

	if (!editor || !post) return <Spinner />

	return (
		<>
			<div>
				<Label htmlFor="categories">Categories</Label>
				<div className="flex items-center gap-1.5">
					<MultiSelect
						options={categories.map(c => ({
							label: c.name,
							value: String(c.id),
						}))}
						selected={post.categories.map(c => ({
							label: c.name,
							value: String(c.id),
						}))}
						onSelectedChange={areSelected => {
							const newCategories = areSelected.map(selected => {
								const existing = categories.find(
									c => String(c.id) === selected.value,
								)
								return existing ?? generateNewCategory(selected.label)
							})

							setPost(prev =>
								prev ? { ...prev, categories: newCategories } : prev,
							)
						}}
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="tags">Tags</Label>
				<div className="flex items-center gap-1.5">
					<MultiSelect
						options={tags.map(t => ({
							label: t.name,
							value: String(t.id),
						}))}
						selected={post.tags.map(t => ({
							label: t.name,
							value: String(t.id),
						}))}
						onSelectedChange={areSelected => {
							const newTags = areSelected.map(selected => {
								const existing = tags.find(t => String(t.id) === selected.value)
								return existing ?? generateNewTag(selected.label)
							})

							setPost(prev => (prev ? { ...prev, tags: newTags } : prev))
						}}
					/>
				</div>
			</div>
		</>
	)
}
