import { useAtom } from 'jotai'
import { Loader2 } from 'lucide-react'

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

import { isDeleteAlertOpenAtom, isDeletingAtom, postAtom } from '../../context'

export const PostDeleteAlert = ({ onDelete }: { onDelete: () => void }) => {
	const [post] = useAtom(postAtom)
	const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useAtom(
		isDeleteAlertOpenAtom,
	)
	const [isDeleting, setIsDeleting] = useAtom(isDeletingAtom)

	if (!post) return null

	return (
		<AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Your post will be deleted permanently!
					</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure to delete{' '}
						<span className="text-primary font-bold">{post.title}</span>? This
						action cannot be undone. (id: {post.id}).
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						disabled={isDeleting}
						onClick={e => {
							e.preventDefault()
							onDelete()
							setIsDeleting(true)
						}}
					>
						{isDeleting && <Loader2 className="animate-spin" />}
						Delete permanently
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
