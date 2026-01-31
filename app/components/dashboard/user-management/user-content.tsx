import { useState } from 'react'
import { Form } from 'react-router'

import { Loader2, Save } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { user } from '~/lib/db/schema'
import { capitalize } from '~/lib/utils'

type User = typeof user.$inferSelect

export const UserContent = ({
	user,
	open,
	setOpen,
	onSubmit,
	isSubmitting = false,
}: {
	user: User
	open: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	onSubmit: (formData: FormData) => void
	isSubmitting?: boolean
}) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-h-[90vh] overflow-scroll sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done. Last
						updated on {user.updatedAt.toLocaleString('zh-TW')}
					</DialogDescription>
				</DialogHeader>
				<Form
					id="user-content"
					className="grid gap-4 py-4"
					onSubmit={e => {
						if (isSubmitting) return
						e.preventDefault()
						const formData = new FormData(e.currentTarget)

						const checkboxFields = ['emailVerified', 'banned']
						checkboxFields.forEach(field => {
							const isChecked = formData.get(field) === 'on'
							formData.set(field, isChecked.toString())
						})

						onSubmit(formData)
					}}
				>
					<input type="hidden" name="id" defaultValue={user.id} />
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							defaultValue={user.email}
							className="col-span-3"
							placeholder="ur@e.mail"
						/>
					</div>

					<BulkEditableFields user={user} />

					{/* TODO: Ban Expires */}
				</Form>
				<DialogFooter>
					<Button form="user-content" type="submit" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

interface BulkEditableFieldsProps {
	user: Pick<
		User,
		'name' | 'image' | 'role' | 'emailVerified' | 'banned' | 'banReason'
	>
	isBulkEdit?: boolean
}
function BulkEditableFields({
	user,
	isBulkEdit = false,
}: BulkEditableFieldsProps) {
	const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set())

	const handleFieldToggle = (fieldName: string, enabled: boolean) => {
		const newSet = new Set(enabledFields)
		if (enabled) {
			newSet.add(fieldName)
		} else {
			newSet.delete(fieldName)
		}
		setEnabledFields(newSet)
	}

	return (
		<>
			<div className="grid grid-cols-4 items-center gap-4">
				<div className="col-span-1 flex items-center gap-2">
					{isBulkEdit && (
						<Checkbox
							name="bulk_name"
							onCheckedChange={checked => handleFieldToggle('name', !!checked)}
						/>
					)}
					<Label
						htmlFor="name"
						className={
							isBulkEdit && !enabledFields.has('name')
								? 'text-muted-foreground'
								: ''
						}
						aria-disabled
					>
						Name
					</Label>
				</div>
				<Input
					id="name"
					name="name"
					defaultValue={user.name ?? undefined}
					className="col-span-3"
					placeholder="Your name"
					disabled={isBulkEdit && !enabledFields.has('name')}
				/>
			</div>
			<div className="grid grid-cols-4 items-center gap-4">
				<div className="col-span-1 flex items-center gap-2">
					{isBulkEdit && (
						<Checkbox
							name="bulk_image"
							onCheckedChange={checked => handleFieldToggle('image', !!checked)}
						/>
					)}
					<Label
						htmlFor="image"
						className={
							isBulkEdit && !enabledFields.has('image')
								? 'text-muted-foreground'
								: ''
						}
					>
						Image
					</Label>
				</div>

				<Input
					id="image"
					name="image"
					defaultValue={user.image ?? undefined}
					className="col-span-3"
					placeholder="e.g. https://placecats.com/300/200"
					disabled={isBulkEdit && !enabledFields.has('image')}
				/>
			</div>
			<div className="grid grid-cols-4 items-center gap-4">
				<div className="col-span-1 flex items-center gap-2">
					{isBulkEdit && (
						<Checkbox
							name="bulk_role"
							onCheckedChange={checked => handleFieldToggle('role', !!checked)}
						/>
					)}
					<Label
						htmlFor="role"
						className={
							isBulkEdit && !enabledFields.has('role')
								? 'text-muted-foreground'
								: ''
						}
					>
						Role
					</Label>
				</div>

				<Select name="role" defaultValue={user.role ?? 'user'}>
					<SelectTrigger
						className="col-span-3 w-full"
						disabled={isBulkEdit && !enabledFields.has('role')}
					>
						<SelectValue id="role" placeholder="what's your role?" />
					</SelectTrigger>
					<SelectContent>
						{['user', 'admin'].map(role => (
							<SelectItem key={role} value={role}>
								{role}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="grid grid-cols-4 items-center gap-4">
				<div className="col-span-1 flex items-center gap-2">
					{isBulkEdit && (
						<Checkbox
							name="bulk_emailVerified"
							onCheckedChange={checked =>
								handleFieldToggle('emailVerified', !!checked)
							}
						/>
					)}
					<Label
						htmlFor="emailVerified"
						className={
							isBulkEdit && !enabledFields.has('emailVerified')
								? 'text-muted-foreground'
								: ''
						}
					>
						Verified
					</Label>
				</div>

				<Checkbox
					id="emailVerified"
					name="emailVerified"
					defaultChecked={user.emailVerified}
					className="col-span-3 ml-2"
					disabled={isBulkEdit && !enabledFields.has('emailVerified')}
				/>
			</div>
			<div className="grid grid-cols-4 items-center gap-4">
				<div className="col-span-1 flex items-center gap-2">
					{isBulkEdit && (
						<Checkbox
							name="bulk_banned"
							onCheckedChange={checked =>
								handleFieldToggle('banned', !!checked)
							}
						/>
					)}
					<Label
						htmlFor="banned"
						className={
							isBulkEdit && !enabledFields.has('banned')
								? 'text-muted-foreground'
								: ''
						}
					>
						Banned
					</Label>
				</div>

				<Checkbox
					id="banned"
					name="banned"
					defaultChecked={user.banned ?? false}
					className="col-span-3 ml-2"
					disabled={isBulkEdit && !enabledFields.has('banned')}
				/>
			</div>
			<div className="grid grid-cols-4 items-center gap-4">
				<div className="col-span-1 flex items-center gap-2">
					{isBulkEdit && (
						<Checkbox
							name="bulk_banReason"
							onCheckedChange={checked =>
								handleFieldToggle('banReason', !!checked)
							}
						/>
					)}
					<Label
						htmlFor="banReason"
						className={
							isBulkEdit && !enabledFields.has('banReason')
								? 'text-muted-foreground'
								: ''
						}
					>
						Ban reason
					</Label>
				</div>

				<Input
					id="banReason"
					name="banReason"
					defaultValue={user.banReason ?? undefined}
					className="col-span-3"
					placeholder="Why the user is banned?"
					disabled={isBulkEdit && !enabledFields.has('banReason')}
				/>
			</div>
		</>
	)
}

type UserBulkEditDialogProps = BulkEditableFieldsProps & {
	isSubmitting: boolean
	onSubmit: (formData: FormData) => void
	open: boolean
	onOpenChange: React.Dispatch<React.SetStateAction<boolean>>
	role: string
}

export const UserBulkEditDialog = ({
	user,
	open,
	onOpenChange,
	role,
	onSubmit,
	isSubmitting,
}: UserBulkEditDialogProps) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Bulk Edit {capitalize(role)}</DialogTitle>
					<DialogDescription>
						You can choose only to update some fields of the selected {role}.
						Please note that changes will apply to all selected {role}.
					</DialogDescription>
				</DialogHeader>
				<Form
					id="update-user"
					className="grid gap-4 py-4"
					onSubmit={e => {
						if (isSubmitting) return
						e.preventDefault()
						const formData = new FormData(e.currentTarget)

						const checkboxFields = ['emailVerified', 'banned']
						checkboxFields.forEach(field => {
							const isChecked = formData.get(field) === 'on'
							formData.set(field, isChecked.toString())
						})

						onSubmit(formData)
					}}
				>
					<BulkEditableFields user={user} isBulkEdit />
				</Form>
				<DialogFooter>
					<Button form="update-user" type="submit" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="animate-spin" />}
						Bulk Edit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
