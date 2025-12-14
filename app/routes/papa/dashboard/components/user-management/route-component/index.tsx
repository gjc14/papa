import { useEffect, useMemo, useRef, useState } from 'react'
import { useFetcher } from 'react-router'

import { type RowSelectionState, type Table } from '@tanstack/react-table'
import { ChevronDown, Loader2, PlusCircle } from 'lucide-react'

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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { user as userTable } from '~/lib/db/schema'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

import { DashboardDataTable } from '../../dashboard-data-table'
import { useSkipper } from '../../dashboard-data-table/hooks'
import { UserBulkEditDialog } from '../user-content'
import { columns } from './columns'

type User = typeof userTable.$inferSelect

export const UserManagementRoute = ({
	users,
	role,
}: {
	users: User[]
	role: 'admin' | 'user'
}) => {
	const fetcher = useFetcher()
	const { isLoading, isSubmitting } = useFetcherNotification(fetcher)

	const tableRef = useRef<Table<User>>(null)
	const [shouldSkip, skip] = useSkipper()
	const [state, setState] = useState(users)

	useEffect(() => {
		skip()
		setState(users)
	}, [users])

	const [openInviteDialog, setOpenInviteDialog] = useState(false)
	const [openBulkEdit, setOpenBulkEdit] = useState(false)
	const [openBulkDeleteAlert, setOpenBulkDeleteAlert] = useState(false)

	const onBulkDelete = () => {
		// if (selectedUsers.length === 0) return
		// const idsToDelete = selectedUsers.map(user => user.id)
		// fetcher.submit(
		// 	{ id: idsToDelete },
		// 	{
		// 		method: 'DELETE',
		// 		action: '/dashboard/user/resource',
		// 	},
		// )
	}

	const onBulkEdit = (formData: FormData) => {
		// if (selectedUsers.length === 0) return
		// const idsToEdit = selectedUsers.map(user => user.id).join(',')
		// formData.set('id', idsToEdit)
		// fetcher.submit(formData, {
		// 	method: 'PUT',
		// 	action: '/dashboard/user/resource',
		// })
	}

	useEffect(() => {
		if (isLoading) {
			switch (fetcher.formMethod) {
				case 'DELETE':
					setOpenBulkDeleteAlert(false)
					break
				case 'PUT':
					setOpenBulkEdit(false)
					break
				case 'POST':
					setOpenInviteDialog(false)
					break
			}
		}
	}, [fetcher.state, fetcher.formMethod])

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle
					title={role === 'admin' ? 'Admins' : 'Users'}
				></DashboardTitle>
				<DashboardActions>
					<Button
						size={'sm'}
						disabled={isSubmitting && fetcher.formMethod === 'POST'}
						onClick={() => setOpenInviteDialog(true)}
					>
						{isSubmitting && fetcher.formMethod === 'POST' ? (
							<Loader2 className="animate-spin" />
						) : (
							<PlusCircle />
						)}
						<p className="text-xs">
							Invite {role === 'admin' ? 'admin' : 'user'}
						</p>
					</Button>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent className="px-0 md:px-0">
				{/* {table => (
						<div className="flex w-full items-center justify-between gap-2">
							<Input
								placeholder="Filter email..."
								type="email"
								autoComplete="off"
								value={
									(table.getColumn('email')?.getFilterValue() as string) ?? ''
								}
								onChange={event =>
									table.getColumn('email')?.setFilterValue(event.target.value)
								}
								className="max-w-sm"
							/>
							<DropdownMenu>
								<DropdownMenuTrigger asChild hidden={!selectedUsers.length}>
									<Button variant="outline" disabled={!selectedUsers.length}>
										Actions
										<ChevronDown />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="space-y-1">
									<DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setOpenBulkEdit(true)}>
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setOpenBulkDeleteAlert(true)}
										className="bg-destructive text-white"
									>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)} */}
				<DashboardDataTable
					columns={columns}
					data={state}
					setData={setState}
					ref={tableRef}
					autoResetPageIndex={shouldSkip}
					skipAutoResetPageIndex={skip}
					className="px-2 md:px-3"
					initialPageSize={20}
				/>

				<Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								Invite {role === 'admin' ? 'admin' : 'user'}
							</DialogTitle>
							<DialogDescription>
								We'll send an invitation link to email address provided.
							</DialogDescription>
						</DialogHeader>
						<fetcher.Form
							id="invite-user"
							className="flex flex-col items-baseline gap-1.5 md:flex-row"
							method="POST"
							action="/dashboard/user/resource"
						>
							<input type="hidden" name="role" value={role} />
							<div className="w-full">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									placeholder="Email"
									type="email"
									name="email"
								/>
							</div>
							<div className="w-full">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									placeholder="Little prince"
									type="name"
									name="name"
								/>
							</div>
						</fetcher.Form>
						<DialogFooter>
							<Button
								form="invite-user"
								type="submit"
								disabled={isSubmitting && fetcher.formMethod === 'POST'}
							>
								{isSubmitting && fetcher.formMethod === 'POST' ? (
									<Loader2 className="animate-spin" />
								) : (
									<PlusCircle />
								)}
								Invite
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* {selectedUsers.length > 0 && (
					<UserBulkEditDialog
						user={selectedUsers[0]}
						open={openBulkEdit}
						onOpenChange={setOpenBulkEdit}
						role={role}
						onSubmit={formData => onBulkEdit(formData)}
						isSubmitting={isSubmitting && fetcher.formMethod === 'PUT'}
					/>
				)} */}

				{/* <AlertDialog
					open={openBulkDeleteAlert}
					onOpenChange={setOpenBulkDeleteAlert}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete{' '}
								<span className="text-primary font-bold">
									{selectedUsers.length}
								</span>{' '}
								{role === 'admin' ? 'admins' : 'users'}.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className="bg-destructive hover:bg-destructive/90 text-white"
								onClick={e => {
									e.preventDefault()
									onBulkDelete()
								}}
								disabled={isSubmitting && fetcher.formMethod === 'DELETE'}
							>
								{isSubmitting && fetcher.formMethod === 'DELETE' && (
									<Loader2 className="animate-spin" />
								)}
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog> */}
			</DashboardContent>
		</DashboardLayout>
	)
}
