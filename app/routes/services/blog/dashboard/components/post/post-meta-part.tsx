/**
 * PostMetaPart Component
 * This component is responsible for rendering the meta part of the post editor.
 */

import { useAtom } from 'jotai'
import { CloudAlert, Loader } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Spinner } from '~/components/ui/spinner'
import { Textarea } from '~/components/ui/textarea'
import { SeparatorWithText } from '~/components/separator-with-text'
import { generateSeoDescription, generateSlug } from '~/lib/utils/seo'
import { FileGrid } from '~/routes/dashboard/assets/components/file-grid'

import { PostStatus } from '../../../lib/db/schema'
import { editorAtom, postAtom } from '../../context'
import { useAssetsContext } from '../../hooks'
import { TinyLinkButton } from './tiny-link-button'

export const PostMetaPart = () => {
	const [post, setPost] = useAtom(postAtom)
	const [editor] = useAtom(editorAtom)

	const { filesContext, isLoading } = useAssetsContext()
	const files = filesContext?.files || []
	const origin = filesContext?.origin || ''
	const hasObjectStorage = filesContext?.hasObjectStorage || false

	if (!editor || !post) return <Spinner />

	const handleSlug = () => {
		const slug = generateSlug(post.title, {
			fallbackPrefix: 'post',
		})

		setPost(prev => {
			if (!prev) return prev
			const newPost = {
				...prev,
				slug,
			}
			return newPost
		})
	}

	const handleExcerpt = () => {
		setPost(prev => {
			if (!prev) return prev
			const text = editor.getText() || ''
			if (!text) {
				toast.error('No content to generate excerpt')
				return prev
			}
			const newPost = {
				...prev,
				excerpt: generateSeoDescription(text),
			}
			return newPost
		})
	}

	return (
		<>
			<div>
				<img
					src={post.featuredImage || '/logo.png'}
					alt="featured image"
					className="mb-2 h-40 w-full object-cover"
				/>
				<Label htmlFor="image">Image</Label>
				<Input
					id="imageUrl"
					name="imageUrl"
					type="text"
					placeholder="Featured image URL?"
					value={post.featuredImage || ''}
					onChange={e => {
						setPost(prev => {
							if (!prev) return prev
							const newPost = {
								...prev,
								featuredImage: e.target.value,
							}
							return newPost
						})
					}}
				/>
				<SeparatorWithText text="Or" />
				{isLoading ? (
					<Button
						size={'sm'}
						variant={'secondary'}
						className="mt-2 w-full"
						disabled
					>
						<Loader className="animate-spin" /> Select from Gallery
					</Button>
				) : hasObjectStorage ? (
					<FileGrid
						files={files}
						origin={origin}
						dialogTrigger={
							<Button size={'sm'} variant={'secondary'} className="mt-2 w-full">
								Select from Gallery
							</Button>
						}
						onFileSelect={file => {
							setPost(prev => {
								if (!prev) return prev
								const newPost = {
									...prev,
									featuredImage: `/assets/${file.id}`,
								}
								return newPost
							})
						}}
					/>
				) : (
					<div className="text-muted-foreground flex w-full flex-1 flex-col items-center justify-center gap-2 border px-2 py-3">
						<CloudAlert size={30} />
						<p className="max-w-sm text-center text-xs">
							Please setup your S3 Object Storage to start using assets.
						</p>
					</div>
				)}
			</div>
			<div>
				<Label htmlFor="status">Status</Label>
				<Select
					value={post.status}
					name="status"
					onValueChange={v => {
						if (!v) return
						setPost(prev => {
							if (!prev) return prev
							const newPost = {
								...prev,
								status: v,
							}
							return newPost
						})
					}}
				>
					<SelectTrigger id="status" className="w-[180px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						{PostStatus.map(status => (
							<SelectItem key={status} value={status}>
								{status}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor="slug">
					Slug
					<TinyLinkButton title="Generate Slug" onClick={handleSlug} />
				</Label>
				<div className="flex items-center gap-1.5">
					<Input
						id="slug"
						name="slug"
						type="text"
						placeholder="How to display your post in the URL?"
						value={post.slug}
						onChange={e => {
							setPost(prev => {
								if (!prev) return prev
								const newPost = {
									...prev,
									slug: e.target.value,
								}
								return newPost
							})
						}}
					/>
				</div>
				{/* Add preview */}
			</div>

			<div>
				<Label htmlFor="excerpt">
					Excerpt
					<TinyLinkButton title="Generate from post" onClick={handleExcerpt} />
				</Label>
				<Textarea
					id="excerpt"
					name="excerpt"
					rows={3}
					placeholder="Short description about your post..."
					value={post.excerpt || ''}
					onChange={e => {
						setPost(prev => {
							if (!prev) return prev
							const newPost = {
								...prev,
								excerpt: e.target.value,
							}
							return newPost
						})
					}}
				/>
			</div>
		</>
	)
}
