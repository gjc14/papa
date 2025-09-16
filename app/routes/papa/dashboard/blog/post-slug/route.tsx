import type { Route } from './+types/route'
import { useEffect } from 'react'
import { useFetcher, useNavigate, useNavigation } from 'react-router'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { HeartCrack } from 'lucide-react'

import { Loading } from '~/components/loading'
import { useIsMobile } from '~/hooks/use-mobile'
import { getPostBySlug } from '~/lib/db/post.server'
import { generateSlug } from '~/lib/utils/seo'
import { Post } from '~/routes/web/blog/components/post'

import { ContentEditor } from '../components/editor'
import { Toolbar } from '../components/editor/editor-toolbar'
import { PostDeleteAlert } from '../components/post/delete-alert'
import { LocalStorageCheck } from '../components/post/local-storage-check'
import { PostSettings } from '../components/post/post-settings'
import { PostResetAlert } from '../components/post/reset-alert'
import {
	editorAtom,
	hasChangesAtom,
	isDeletingAtom,
	isSavingAtom,
	postAtom,
	serverPostAtom,
} from '../context'
import type { action } from '../resource'
import { FloatingToolbar } from './floating-toolbar'
import { generateNewPost } from './utils'

export const loader = async ({ params }: Route.LoaderArgs) => {
	const isCreate = params.postSlug === 'new'
	if (isCreate) {
		return { post: { post: null } }
	}

	// Get post data from database
	process.env.NODE_ENV === 'development' && console.time('getPostBySlug')
	const post = await getPostBySlug(params.postSlug, 'EDIT')
	process.env.NODE_ENV === 'development' && console.timeEnd('getPostBySlug')

	return { post }
}

export default function DashboardSlugPost({
	loaderData,
	matches,
	params,
}: Route.ComponentProps) {
	const { post: sPost } = loaderData

	const adminMatch = matches[1]
	const { admin } = adminMatch.data

	const isCreate = params.postSlug === 'new'
	const currentPost = isCreate ? generateNewPost(admin) : sPost.post

	const isMobile = useIsMobile()
	const fetcher = useFetcher<typeof action>()
	const navigate = useNavigate()
	const navigation = useNavigation()

	const isNavigating = navigation.state === 'loading'

	const isSubmitting = fetcher.state === 'submitting'
	const method = fetcher.formMethod

	const isSaving = isSubmitting && (method === 'PUT' || method === 'POST')
	const isDeleting = isSubmitting && method === 'DELETE'

	useHydrateAtoms([
		[serverPostAtom, currentPost],
		[postAtom, currentPost],
		[isSavingAtom, isSaving],
		[isDeletingAtom, isDeleting],
	])

	const [, setServerPost] = useAtom(serverPostAtom)
	const [post, setPost] = useAtom(postAtom)
	const [, setIsSaving] = useAtom(isSavingAtom)
	const [, setIsDeleting] = useAtom(isDeletingAtom)

	const [editor] = useAtom(editorAtom)
	const [hasChanges] = useAtom(hasChangesAtom)

	// When route changes, update post atoms
	useEffect(() => {
		setServerPost(currentPost)
		setPost(currentPost)
	}, [params.postSlug])

	// When saving/deleting state changes, update atoms
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
					// Update atoms with returned data
					setServerPost(data)
					setPost(data)
					data.slug !== post?.slug && navigate('/dashboard/blog/' + data.slug)
					window.localStorage.removeItem(`dirty-post-${post?.id}`)
				}
			}
		}
	}, [fetcher.state, fetcher.formMethod, fetcher.data, isSubmitting])

	if (isNavigating) {
		return (
			<div className="mx-auto flex h-full flex-1 flex-col items-center justify-center space-y-6">
				<Loading />
			</div>
		)
	}

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
			<FloatingToolbar onSave={handleSave} isCreate={isCreate} />

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
