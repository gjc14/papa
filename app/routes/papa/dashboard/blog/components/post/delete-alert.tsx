import { useEffect } from 'react'
import { useFetcher, useNavigate } from 'react-router'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
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
import { useFetcherNotification } from '~/hooks/use-notification'

import { isDeleteAlertOpenAtom, isDeletingAtom, postAtom } from '../../context'

export const PostDeleteAlert = ({ isCreate }: { isCreate: boolean }) => {
	const fetcher = useFetcher()
	const navigate = useNavigate()
	useFetcherNotification(fetcher)

	const isSubmitting = fetcher.state === 'submitting'
	const method = fetcher.formMethod
	const isDeleting = isSubmitting && method === 'DELETE'

	const [post] = useAtom(postAtom)
	const [, setIsDeleting] = useAtom(isDeletingAtom)
	const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useAtom(
		isDeleteAlertOpenAtom,
	)

	useHydrateAtoms([[isDeletingAtom, isDeleting]])

	useEffect(() => {
		setIsDeleting(isDeleting)
	}, [isDeleting])

	useEffect(() => {
		if (
			fetcher.state === 'loading' &&
			fetcher.data &&
			fetcher.formMethod === 'DELETE' &&
			'msg' in fetcher.data
		) {
			navigate('/dashboard/blog')
		}
	}, [fetcher.state, fetcher.formMethod, fetcher.data, isSubmitting])

	if (!post) return null

	const handleDelete = async () => {
		if (isSubmitting || isCreate) return

		fetcher.submit(
			{ id: post.id },
			{
				method: 'DELETE',
				action: '/dashboard/blog/resource',
				encType: 'application/json',
			},
		)
	}

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
							handleDelete()
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
