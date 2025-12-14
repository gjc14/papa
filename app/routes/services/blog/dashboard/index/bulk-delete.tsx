import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'

export const BulkDeleteAlertDialog = ({
	numberOfRowsDeleting,
	onDelete,
	isDeleting,
}: {
	numberOfRowsDeleting: number
	onDelete: () => void
	isDeleting: boolean
}) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button size={'sm'} variant={'destructive'} disabled={isDeleting}>
					{isDeleting && <Spinner />}
					{`Delete Posts (${numberOfRowsDeleting})`}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete{' '}
						{numberOfRowsDeleting} selected post
						{numberOfRowsDeleting > 1 ? 's' : ''} from the server.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onDelete} disabled={isDeleting}>
						{isDeleting && <Spinner />}
						{`Delete ${numberOfRowsDeleting} Posts`}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
