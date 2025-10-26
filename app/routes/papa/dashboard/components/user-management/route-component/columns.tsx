import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'

import { type ColumnDef } from '@tanstack/react-table'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { user as userTable } from '~/lib/db/schema'
import { DashboardDataTableMoreMenu } from '~/routes/papa/dashboard/components/data-table'

import { SimpleSortHeader } from '../../data-table/simple-sort-header'
import { UserContent } from '../user-content'

type User = typeof userTable.$inferSelect

export const columns: ColumnDef<
	User & {
		setRowsDeleting: React.Dispatch<React.SetStateAction<Set<string>>>
	}
>[] = [
	{
		accessorKey: 'image',
		header: '🙂',
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
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Email</SimpleSortHeader>
		},
	},
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Name</SimpleSortHeader>
		},
	},
	{
		accessorKey: 'role',
		header: 'Role',
	},
	{
		accessorKey: 'emailVerified',
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Email Verified</SimpleSortHeader>
		},
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
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Banned</SimpleSortHeader>
		},
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
		header: ({ column }) => {
			return <SimpleSortHeader column={column}>Updated At</SimpleSortHeader>
		},
		accessorFn: row => new Date(row.updatedAt).toLocaleString('zh-TW'),
	},
	{
		accessorKey: 'id',
		header: 'Edit',
		cell: ({ row }) => {
			const fetcher = useFetcher()
			const { mutating, isSubmitting } = useFetcherNotification(fetcher, {
				alertWhen: 'idle',
			})
			const [open, setOpen] = useState(false)

			const rowId = row.id
			const id = row.original.id
			const userEmail = row.original.email

			useEffect(() => {
				if (mutating) {
					row.original.setRowsDeleting(prev => {
						const newSet = new Set(prev)
						newSet.add(rowId)
						return newSet
					})
				} else {
					row.original.setRowsDeleting(prev => {
						const newSet = new Set(prev)
						newSet.delete(rowId)
						return newSet
					})
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
