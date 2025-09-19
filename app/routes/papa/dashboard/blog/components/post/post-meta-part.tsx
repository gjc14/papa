/**
 * PostMetaPart Component
 * This component is responsible for rendering the meta part of the post editor.
 */
import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'

import { toast } from '@gjc14/sonner'
import { useAtom } from 'jotai'
import { CloudAlert, Loader } from 'lucide-react'

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
import { Textarea } from '~/components/ui/textarea'
import { Loading } from '~/components/loading'
import { SeparatorWithText } from '~/components/separator-with-text'
import { PostStatus, type FileMetadata } from '~/lib/db/schema'
import { generateSeoDescription, generateSlug } from '~/lib/utils/seo'
import type { loader } from '~/routes/papa/dashboard/assets/resource'

import { FileGrid } from '../../../assets/components/file-grid'
import { assetResourceRoute } from '../../../assets/utils'
import { editorAtom, postAtom } from '../../context'
import { TinyLinkButton } from './tiny-link-button'

export const PostMetaPart = () => {
	const [post, setPost] = useAtom(postAtom)
	const [editor] = useAtom(editorAtom)
	const fetcher = useFetcher<typeof loader>()

	const fileLoadedRef = useRef(false)
	const [files, setFiles] = useState<FileMetadata[]>([])
	const [origin, setOrigin] = useState<string>('')
	const [hasObjectStorage, setHasObjectStorage] = useState(false)

	const isLoading = fetcher.state !== 'idle'

	useEffect(() => {
		if (fileLoadedRef.current) return
		fetcher.load(assetResourceRoute)
	}, [])

	useEffect(() => {
		if (fetcher.data) {
			setFiles(fetcher.data.files)
			setOrigin(fetcher.data.origin)
			setHasObjectStorage(fetcher.data.hasObjectStorage)
			fileLoadedRef.current = true
		}
	}, [fetcher])

	if (!editor || !post) return <Loading />

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
					className="mb-2 h-40 w-full rounded-md object-cover"
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
				{!fileLoadedRef.current || isLoading ? (
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
					<div className="flex h-full min-h-60 w-full grow flex-col items-center justify-center gap-3 rounded-xl border">
						<CloudAlert size={50} />
						<p className="max-w-sm text-center">
							Please setup your S3 Object Storage to start uploading assets
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
