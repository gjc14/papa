import { useState } from 'react'
import { useFetcher } from 'react-router'

import { Loader2, MoreHorizontal } from 'lucide-react'

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
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Spinner } from '~/components/ui/spinner'
import { useFetcherNotification } from '~/hooks/use-notification'

export const DashboardDataTableMoreMenu = ({
	id,
	children,
	hideDelete,
	deleteTarget = '-->',
	onDelete,
	permanent = true,
}: {
	id: number | string
	/** Optional children, you could use <DropdownMenuItem> */
	children?: React.ReactNode
	/** If you don't want to provide delete function */
	hideDelete?: boolean
	/**
	 * Pass in for the display name of this object
	 * @default - using id
	 */
	deleteTarget?: string
	/** Callback function to handle deletion */
	onDelete?: () => void
	/** If the deletion is permanent or move to trash */
	permanent?: boolean
}) => {
	const fetcher = useFetcher()
	const { mutating } = useFetcherNotification(fetcher)
	const [open, setOpen] = useState(false)

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size={'icon'} disabled={mutating}>
					<span className="sr-only">Open menu</span>
					{mutating ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuLabel>Manage</DropdownMenuLabel>

				{children && (
					<>
						<DropdownMenuSeparator />
						{children}
					</>
				)}

				{!hideDelete && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setOpen(true)}>
							{permanent ? 'Delete Permanently' : 'Move to Trash'}
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{permanent ? 'Are you absolutely sure?' : 'Move to Trash?'}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{permanent
								? 'This action cannot be undone. This will permanently delete'
								: 'Are you sure you want to move to trash?'}
							<span className="text-primary font-bold"> {deleteTarget} </span>
							(id: {id}).
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90 text-white"
							onClick={onDelete}
						>
							{mutating && <Spinner />}
							{permanent ? 'Delete Permanently' : 'Move to Trash'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DropdownMenu>
	)
}
