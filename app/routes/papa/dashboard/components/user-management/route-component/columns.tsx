import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { user as userTable } from '~/lib/db/schema'
import { DashboardDataTableMoreMenu } from '~/routes/papa/dashboard/components/dashboard-data-table'

import { UserContent } from '../user-content'

type User = typeof userTable.$inferSelect

export const columns: ColumnDef<User>[] = [
	{
		id: '_avatar',
		cell: ({ row }) => {
			return (
				<div className="flex items-center justify-center">
					<Avatar className="h-8 w-8 rounded-full">
						<AvatarImage
							src={row.original.image || '/placeholders/avatar.png'}
							alt={row.original.name}
						/>
						<AvatarFallback>PA</AvatarFallback>
					</Avatar>
				</div>
			)
		},
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'role',
		header: 'Role',
	},
	{
		accessorKey: 'emailVerified',
		header: 'Email Verified',
		cell: ({ row }) => {
			return (
				<Badge
					variant={row.original.emailVerified ? 'secondary' : 'destructive'}
				>
					{row.original.emailVerified ? 'Yes' : 'No'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'banned',
		header: 'Banned',
		cell: ({ row }) => {
			return (
				<Badge variant={row.original.banned ? 'destructive' : 'secondary'}>
					{row.original.banned ? 'Yes' : 'No'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'updatedAt',
		header: 'Updated At',
		cell: ({ row }) => row.original.updatedAt.toLocaleString('zh-TW'),
	},
	{
		id: '_actions',
		cell: ({ row, table }) => {
			const fetcher = useFetcher()
			const { mutating, isSubmitting } = useFetcherNotification(fetcher)
			const [open, setOpen] = useState(false)

			const rowId = row.id
			const id = row.original.id
			const userEmail = row.original.email

			useEffect(() => {
				if (mutating) {
					// row.original.setRowsDeleting(prev => {
					// 	const newSet = new Set(prev)
					// 	newSet.add(rowId)
					// 	return newSet
					// })
				} else {
					// row.original.setRowsDeleting(prev => {
					// 	const newSet = new Set(prev)
					// 	newSet.delete(rowId)
					// 	return newSet
					// })
				}
			}, [mutating])

			return (
				<>
					<DashboardDataTableMoreMenu
						id={id}
						deleteTarget={userEmail}
						onDelete={() => {
							fetcher.submit(
								{ id },
								{
									method: 'DELETE',
									action: '/dashboard/user/resource',
								},
							)
						}}
					>
						<DropdownMenuItem onClick={() => setOpen(true)}>
							Edit
						</DropdownMenuItem>
					</DashboardDataTableMoreMenu>
					<UserContent
						onSubmit={formData => {
							fetcher.submit(formData, {
								method: 'PUT',
								action: '/dashboard/user/resource',
							})
						}}
						isSubmitting={
							fetcher.formAction === '/dashboard/user/resource' && isSubmitting
						}
						user={{
							...row.original,
							updatedAt: new Date(row.original.updatedAt),
						}}
						open={open}
						setOpen={setOpen}
					/>
				</>
			)
		},
	},
]
