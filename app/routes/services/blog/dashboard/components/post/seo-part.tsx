/**
 * Contains the SEO part of the post editor.
 * It includes the SEO title and SEO description fields.
 */
import { toast } from '@gjc14/sonner'
import { useAtom } from 'jotai'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Spinner } from '~/components/ui/spinner'
import { Textarea } from '~/components/ui/textarea'
import { MultiSelect } from '~/components/multi-select'
import { generateSeoDescription } from '~/lib/utils/seo'

import type { PostWithRelations } from '../../../lib/db/post.server'
import { editorAtom, postAtom } from '../../context'
import { TinyLinkButton } from './tiny-link-button'

export const SeoPart = () => {
	const [post, setPost] = useAtom(postAtom)
	const [editor] = useAtom(editorAtom)

	if (!editor || !post) return <Spinner />

	const handleTitle = () => {
		setPost(prev => {
			if (!prev) return prev
			const newPost = {
				...prev,
				seo: {
					...prev.seo,
					metaTitle: post.title,
				},
			} satisfies PostWithRelations
			return newPost
		})
	}

	const handleDesc = () => {
		setPost(prev => {
			if (!prev) return prev
			const text = editor.getText() || ''
			if (!text) {
				toast.error('No content to generate SEO description')
				return prev
			}
			const newPost = {
				...prev,
				seo: {
					...prev.seo,
					metaDescription: generateSeoDescription(text),
				},
			} satisfies PostWithRelations
			return newPost
		})
	}

	const handleOgImage = () => {
		setPost(prev => {
			if (!prev) return prev
			const newPost = {
				...prev,
				seo: {
					...prev.seo,
					ogImage: post.featuredImage,
				},
			} satisfies PostWithRelations
			return newPost
		})
	}

	return (
		<>
			<div className="flex flex-col">
				<Label htmlFor="seo-title">
					SEO Title
					<TinyLinkButton title="Copy Title" onClick={handleTitle} />
				</Label>
				<div className="flex items-center gap-1.5">
					<Input
						id="seo-title"
						name="seo-title"
						type="text"
						placeholder="Meta tilte should match Title (H1) for SEO."
						value={post.seo.metaTitle || ''}
						onChange={e => {
							setPost(prev => {
								if (!prev) return prev
								const newPost = {
									...prev,
									seo: {
										...prev.seo,
										metaTitle: e.target.value,
									},
								} satisfies PostWithRelations
								return newPost
							})
						}}
					/>
				</div>
			</div>

			<div className="flex flex-col">
				<Label htmlFor="seo-description">
					SEO Description
					<TinyLinkButton title="Copy from post" onClick={handleDesc} />
				</Label>
				<Textarea
					id="seo-description"
					name="seo-description"
					rows={3}
					placeholder="Short description about your post..."
					value={post.seo.metaDescription ?? ''}
					onChange={e => {
						setPost(prev => {
							if (!prev) return prev
							const newPost = {
								...prev,
								seo: {
									...prev.seo,
									metaDescription: e.target.value,
								},
							} satisfies PostWithRelations
							return newPost
						})
					}}
				/>
			</div>

			<div className="flex flex-col">
				<Label htmlFor="seo-keywords">SEO Keywords</Label>
				<MultiSelect
					options={[]}
					selected={(post.seo.keywords ?? '')
						.split(',')
						.map(k => k.trim())
						.filter(k => k !== '')
						.map(k => ({ label: k, value: k }))}
					onSelectedChange={selectedArr => {
						const keywords = selectedArr.map(s => s.label).join(', ')
						setPost(prev => {
							if (!prev) return prev
							return {
								...prev,
								seo: {
									...prev.seo,
									keywords,
								},
							}
						})
					}}
				/>
			</div>

			<div className="flex flex-col">
				<div className="mb-2">
					<div className="inline-flex aspect-square h-16 w-16 items-center justify-center rounded-md border">
						{post.seo.ogImage ? (
							<img
								src={post.seo.ogImage}
								alt={post.title}
								className="object-cover"
							/>
						) : (
							'⛰️'
						)}
					</div>
					{/* TODO: tabs to preview different image ratios */}
				</div>
				<Label htmlFor="seo-og-image">
					SEO Open Graph Image
					<TinyLinkButton title="Copy Feature Image" onClick={handleOgImage} />
				</Label>
				<div className="flex items-center gap-1.5">
					<Input
						id="seo-og-image"
						name="seo-og-image"
						type="text"
						placeholder="https://example.com/image.webp"
						value={post.seo.ogImage || ''}
						onChange={e => {
							setPost(prev => {
								if (!prev) return prev
								const newPost = {
									...prev,
									seo: {
										...prev.seo,
										ogImage: e.target.value,
									},
								} satisfies PostWithRelations
								return newPost
							})
						}}
					/>
				</div>
			</div>
		</>
	)
}
