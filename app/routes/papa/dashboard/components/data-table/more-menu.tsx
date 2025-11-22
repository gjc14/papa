import { useState } from 'react'

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

export const DashboardDataTableMoreMenu = ({
	id,
	children,
	deletable = true,
	deleteTarget = '-->',
	onDelete,
	mutating,
	permanent = true,
}: {
	id: number | string
	/** Use [DropdownMenuItem]('../../../../../../../components/ui/dropdown-menu.tsx) */
	children?: React.ReactNode
	/** If you don't want to provide delete function @default true */
	deletable?: boolean
	/** Pass in for the display name of this object */
	deleteTarget?: string
	/** Callback function to delete */
	onDelete?: () => void
	/** If the item is mutating */
	mutating?: boolean
	/** Delete permanent or move to trash @default true */
	permanent?: boolean
}) => {
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

				{deletable && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => setOpen(true)}
							className="hover:bg-destructive/90 dark:hover:bg-destructive/90 hover:text-white"
						>
							{permanent ? 'Delete Permanently' : 'Move to Trash'}
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{permanent ? 'Delete Permanently' : 'Move to Trash?'}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{permanent ? (
								<>
									Your about to PERMANENTLY delete
									<span className="text-primary font-bold">
										{` ${deleteTarget} `}
									</span>
								</>
							) : (
								<>
									Are you sure you want to move
									<span className="text-primary font-bold">
										{` ${deleteTarget} `}
									</span>
									to trash?
								</>
							)}
							{` (id: ${id}).`}
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
