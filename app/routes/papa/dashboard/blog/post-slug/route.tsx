import { useEffect } from 'react'
import { useFetcher, useNavigate, useNavigation } from 'react-router'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { HeartCrack } from 'lucide-react'

import { Loading } from '~/components/loading'
import { useIsMobile } from '~/hooks/use-mobile'
import { generateSlug } from '~/lib/utils/seo'
import { Post } from '~/routes/web/blog/components/post'

import type { Route } from '../+types/layout'
import { ContentEditor } from '../components/editor'
import { Toolbar } from '../components/editor/editor-toolbar'
import { PostDeleteAlert } from '../components/post/delete-alert'
import { LocalStorageCheck } from '../components/post/local-storage-check'
import { PostSettings } from '../components/post/post-settings'
import { PostResetAlert } from '../components/post/reset-alert'
import {
	categoriesAtom,
	editorAtom,
	hasChangesAtom,
	isDeletingAtom,
	isSavingAtom,
	postAtom,
	serverPostAtom,
	tagsAtom,
} from '../context'
import type { action } from '../resource'
import { FloatingTools } from './floating-tools'
import { generateNewPost } from './utils'

export default function DashboardSlugPost({
	matches,
	params,
}: Route.ComponentProps) {
	const adminMatch = matches[1]
	const { admin } = adminMatch.data

	const isCreate = params.postSlug === 'new'
	const blogMatch = matches[2]
	const { tags, categories, posts } = blogMatch.data
	const currentPost = isCreate
		? generateNewPost(admin)
		: posts.find(p => p.slug === params.postSlug)

	const isMobile = useIsMobile()
	const fetcher = useFetcher<typeof action>()
	const navigate = useNavigate()

	const isSubmitting = fetcher.state === 'submitting'

	const method = fetcher.formMethod
	const isSaving = isSubmitting && (method === 'PUT' || method === 'POST')
	const isDeleting = isSubmitting && method === 'DELETE'

	useHydrateAtoms([
		[serverPostAtom, currentPost],
		[postAtom, currentPost],
		[tagsAtom, tags],
		[categoriesAtom, categories],

		[isSavingAtom, isSaving],
		[isDeletingAtom, isDeleting],
	])

	const [editor] = useAtom(editorAtom)

	const [post, setPost] = useAtom(postAtom)
	const [, setServerPost] = useAtom(serverPostAtom)
	const [hasChanges] = useAtom(hasChangesAtom)
	const [, setIsSaving] = useAtom(isSavingAtom)
	const [, setIsDeleting] = useAtom(isDeletingAtom)

	useEffect(() => {
		setPost(currentPost)
		setServerPost(currentPost)
	}, [params.postSlug, setPost])

	useEffect(() => {
		setIsSaving(isSaving)
		setIsDeleting(isDeleting)
	}, [isSaving, isDeleting])

	useEffect(() => {
		if (fetcher.state === 'loading' && fetcher.data) {
			if (fetcher.formMethod === 'DELETE' && 'data' in fetcher.data) {
				fetcher.data.data && navigate('/dashboard/blog')
			}
			if (
				(fetcher.formMethod === 'PUT' || fetcher.formMethod === 'POST') &&
				'data' in fetcher.data
			) {
				const data = fetcher.data.data
				if (data) {
					data.slug !== post?.slug && navigate('/dashboard/blog/' + data.slug)
					window.localStorage.removeItem(`dirty-post-${post?.id}`)
				}
			}
		}
	}, [fetcher.state, fetcher.formMethod, isSubmitting])

	if (!post) {
		return (
			<div className="mx-auto flex h-full flex-1 flex-col items-center justify-center space-y-6">
				<HeartCrack className="size-36" />
				<h2>Post Not found</h2>
			</div>
		)
	}

	// Handle database save
	const handleSave = () => {
		if (
			!post ||
			!editor ||
			!hasChanges ||
			isSaving ||
			isDeleting ||
			isSubmitting
		)
			return

		const now = new Date().toISOString().replace(/T/, '@').split('.')[0]

		// Remove date fields and set default values
		const postReady = {
			...post,
			title: post.title || `p-${now}`,
			slug:
				post.slug ||
				generateSlug(post.title || `p-${now}`, {
					fallbackPrefix: 'post',
					prevent: ['new'],
				}),
			content: JSON.stringify(editor.getJSON()),
			createdAt: undefined,
			updatedAt: undefined,
			seo: {
				...post.seo,
				createdAt: undefined,
				updatedAt: undefined,
			},
		}

		fetcher.submit(JSON.stringify(postReady), {
			method: isCreate ? 'POST' : 'PUT',
			encType: 'application/json',
			action: '/dashboard/blog/resource',
		})
	}

	// Handle database delete
	const handleDelete = async () => {
		if (!post || isSubmitting || isCreate) return

		fetcher.submit(
			{ id: post.id },
			{
				method: 'DELETE',
				action: '/dashboard/blog/resource',
				encType: 'application/json',
			},
		)
	}

	// Handle post reset
	const handleReset = () => {
		setPost(currentPost)
		editor?.commands.setContent(
			currentPost?.content ? JSON.parse(currentPost.content) : undefined,
		)
	}

	return (
		<div className="relative h-full overflow-hidden">
			{/* Editor toolbar self positioning */}
			<Toolbar isMobile={isMobile} />
			<FloatingTools onSave={handleSave} isCreate={isCreate} />

			<LocalStorageCheck />
			<PostResetAlert onReset={handleReset} />
			<PostDeleteAlert onDelete={handleDelete} />

			<PostSettings />

			{/* Main Content Section */}
			<section
				className={`relative h-full overflow-y-auto py-6 ${isMobile ? 'pb-16' : 'pt-16'}`}
			>
				<div className="mx-auto w-full max-w-prose px-3">
					<Post
						post={post}
						editable
						onTitleChange={title => {
							setPost({
								...post,
								title,
							})
						}}
					>
						<ContentEditor />
					</Post>
				</div>
			</section>
		</div>
	)
}
