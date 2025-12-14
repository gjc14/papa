import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { convertDateFields } from '~/lib/db/utils'

import type { PostWithRelations } from '../../../lib/db/post.server'
import {
	editorAtom,
	isDraftCheckCompleteAtom,
	isRestoreAlertOpenAtom,
	postAtom,
	serverPostAtom,
} from '../../context'
import { postLocalStorageKey } from '../../post-slug/utils'

/**
 * Display alert and options to restore or discard unsaved changes.
 * This component will set `isDraftCheckCompleteAtom` to `true` after user makes a choice.
 * `isDraftCheckCompleteAtom` will be set to `false` when on route change.
 * @link [post-slug route](../../post-slug/route.tsx)
 */
export const PostRestoreAlert = () => {
	const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useAtom(
		isRestoreAlertOpenAtom,
	)
	const [, setIsDraftCheckComplete] = useAtom(isDraftCheckCompleteAtom)
	const [editor] = useAtom(editorAtom)
	const [serverPost] = useAtom(serverPostAtom)
	const [, setPost] = useAtom(postAtom)

	useHydrateAtoms([[isDraftCheckCompleteAtom, false]])

	if (!serverPost || !editor) return null

	const localStorageKey = postLocalStorageKey(serverPost.id)

	const handleDiscard = () => {
		window.localStorage.removeItem(localStorageKey)
		setIsDraftCheckComplete(true)
	}

	const handleRestore = () => {
		const dirtyPost = window.localStorage.getItem(localStorageKey)
		if (!dirtyPost) return

		const draftPost = convertDateFields(
			JSON.parse(dirtyPost),
		) as PostWithRelations
		const { content, ...rest } = draftPost

		// Do not set content because the its state is handled by editor,
		// if set, the post.content will always differ from serverPost.content when areDifferentPosts check
		setPost({ ...rest, content: serverPost.content })
		content && editor.commands.setContent(JSON.parse(content))

		setIsDraftCheckComplete(true)
	}

	return (
		<AlertDialog open={isRestoreAlertOpen} onOpenChange={setIsRestoreAlertOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Unsaved Changes Detected!</AlertDialogTitle>
					<AlertDialogDescription>
						You made some changes to post <strong>{serverPost.title}</strong>{' '}
						(id: {serverPost.id}) last time. Restore or Discard?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleDiscard}>Discard</AlertDialogCancel>
					<AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
