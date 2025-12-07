import { useEffect } from 'react'
import { useFetcher, useNavigate } from 'react-router'

import { atom, useAtom, useAtomValue } from 'jotai'

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
import { useFetcherNotification } from '~/hooks/use-notification'
import { productAtom } from '~/routes/services/ecommerce/store/product/context'

import type { action } from '../../resource'
import {
	isMovingToTrashAtom,
	isResetAlertOpenAtom as isResetOpenAtom,
	isRestoreAlertOpenAtom as isRestoreOpenAtom,
	isToTrashAlertOpenAtom as isToTrashOpenAtom,
} from '../context'

const productIdAtom = atom(get => get(productAtom)?.id ?? null)
const productNameAtom = atom(get => get(productAtom)?.name ?? null)

export function ProductAlerts() {
	const fetcher = useFetcher<typeof action>()
	const navigate = useNavigate()
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)
	useFetcherNotification(fetcher)

	const [resetAlertOpen, setResetAlertOpen] = useAtom(isResetOpenAtom)
	const [restoreAlertOpen, setRestoreAlertOpen] = useAtom(isRestoreOpenAtom)
	const [toTrashAlertOpen, setToTrashAlertOpen] = useAtom(isToTrashOpenAtom)
	const [isMovingToTrash, setIsMovingToTrash] = useAtom(isMovingToTrashAtom)

	useEffect(
		() => setIsMovingToTrash(fetcher.state === 'submitting'),
		[fetcher.state],
	)

	useEffect(() => {
		if (!fetcher.data || 'err' in fetcher.data) return
		navigate('..')
	}, [fetcher.data])

	if (!productId || productName === null) return null

	const onDelete = () => {
		if (isMovingToTrash) return
		fetcher.submit([{ id: productId, name: productName }], {
			method: 'DELETE',
			action: `/dashboard/ecommerce/products/resource`,
			encType: 'application/json',
		})
	}

	return (
		<>
			<ProductActionAlert
				title="Reset Product"
				description={
					<>
						You're going to discard unsaved changes and reset{' '}
						<span className="text-primary font-medium">{productName}</span> to
						latest saved data. This action cannot be undone.
					</>
				}
				actionTitle="Reset"
				onAction={() => console.log('Product reset', productId)}
				open={resetAlertOpen}
				onOpenChange={setResetAlertOpen}
			/>
			<ProductActionAlert
				title="Unsaved Content Detected"
				description={
					<>
						You're going to restore{' '}
						<span className="text-primary font-medium">{productName}</span> to
						its last unsaved state. This action will discard current unsaved
						changes.
					</>
				}
				actionTitle="Restore"
				cancelTitle="Discard"
				onAction={() => console.log('Product restored', productId)}
				open={restoreAlertOpen}
				onOpenChange={setRestoreAlertOpen}
			/>
			<ProductActionAlert
				title="Move Product to Trash"
				description={
					<>
						You're going to move{' '}
						<span className="text-primary font-medium">{productName}</span> to
						the trash. You can restore from Trash within 30 days.
					</>
				}
				actionTitle="Move to Trash"
				onAction={onDelete}
				open={toTrashAlertOpen}
				onOpenChange={setToTrashAlertOpen}
			/>
		</>
	)
}

function ProductActionAlert({
	open,
	onOpenChange,
	title,
	description,
	actionTitle,
	cancelTitle = 'Cancel',
	onAction,
	onCancel,
	children,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: React.ReactNode
	actionTitle?: string
	cancelTitle?: string
	onAction: () => void
	onCancel?: () => void
	children?: React.ReactNode
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description && (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					)}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>
						{cancelTitle}
					</AlertDialogCancel>
					<AlertDialogAction onClick={onAction}>
						{actionTitle}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
