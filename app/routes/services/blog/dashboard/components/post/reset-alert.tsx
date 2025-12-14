import { useAtom } from 'jotai'

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

import {
	editorAtom,
	isResetAlertOpenAtom,
	postAtom,
	serverPostAtom,
} from '../../context'

/**
 * Reset current dirty post to its initial state.
 */
export const PostResetAlert = () => {
	const [isResetAlertOpen, setIsResetAlertOpen] = useAtom(isResetAlertOpenAtom)
	const [post, setPost] = useAtom(postAtom)
	const [serverPost] = useAtom(serverPostAtom)
	const [editor] = useAtom(editorAtom)

	if (!post || !editor) return null

	const handleReset = () => {
		setPost(serverPost)
		editor.commands.setContent(
			serverPost?.content ? JSON.parse(serverPost.content) : undefined,
		)
	}

	return (
		<AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>You're resetting the post</AlertDialogTitle>
					<AlertDialogDescription>
						You are discarding of all unsaved changes for post{' '}
						<strong>{post.title}</strong> (id: {post.id}). Are you sure?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setIsResetAlertOpen(false)}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
