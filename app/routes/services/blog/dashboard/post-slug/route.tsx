import type { Route } from './+types/route'
import { useEffect } from 'react'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { HeartCrack } from 'lucide-react'

import { useIsMobile } from '~/hooks/use-mobile'

import { getPostBySlug } from '../../lib/db/post.server'
import { Post } from '../../web/components/post'
import { ContentEditor } from '../components/editor'
import { Toolbar } from '../components/editor/editor-toolbar'
import { PostDeleteAlert } from '../components/post/delete-alert'
import { PostSettings } from '../components/post/post-settings'
import { PostResetAlert } from '../components/post/reset-alert'
import { PostRestoreAlert } from '../components/post/restore-alert'
import {
	isDeleteAlertOpenAtom,
	isResetAlertOpenAtom,
	isSettingsOpenAtom,
	postAtom,
	serverPostAtom,
} from '../context'
import { FloatingToolbar } from './floating-toolbar'
import { useAutoSaveDraft } from './use-auto-save-draft'
import { useCheckDraft } from './use-check-draft'
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

	useHydrateAtoms([
		[serverPostAtom, currentPost],
		[postAtom, currentPost],

		[isSettingsOpenAtom, false],
		[isResetAlertOpenAtom, false],
		[isDeleteAlertOpenAtom, false],
	])

	const [, setServerPost] = useAtom(serverPostAtom)
	const [post, setPost] = useAtom(postAtom)

	const [, setIsSettingsOpen] = useAtom(isSettingsOpenAtom)
	const [, setIsResetAlertOpen] = useAtom(isResetAlertOpenAtom)
	const [, setIsDeleteAlertOpen] = useAtom(isDeleteAlertOpenAtom)

	// When route changes, update post atoms
	useEffect(() => {
		setServerPost(currentPost)
		setPost(currentPost)

		setIsSettingsOpen(false)
		setIsResetAlertOpen(false)
		setIsDeleteAlertOpen(false)
	}, [params.postSlug])

	if (!post) {
		return (
			<div className="mx-auto flex h-full flex-1 flex-col items-center justify-center space-y-6">
				<HeartCrack className="size-36" />
				<h2>Post Not found</h2>
			</div>
		)
	}

	return (
		<div className="relative h-full overflow-hidden">
			<DraftManager />

			{/* Editor toolbar self positioning */}
			<Toolbar isMobile={isMobile} />
			<FloatingToolbar isCreate={isCreate} />

			<PostRestoreAlert />
			<PostResetAlert />
			<PostDeleteAlert isCreate={isCreate} />

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

const DraftManager = () => {
	useCheckDraft()
	useAutoSaveDraft()
	return null
}
