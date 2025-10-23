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
import { productAtom } from '~/routes/services/ecommerce/store/product/context'

import {
	isResetAlertOpenAtom as isResetOpenAtom,
	isRestoreAlertOpenAtom as isRestoreOpenAtom,
	isToTrashAlertOpenAtom as isToTrashOpenAtom,
} from '../context'

const productIdAtom = atom(get => get(productAtom)?.id || null)
const productNameAtom = atom(get => get(productAtom)?.name || null)

export function ProductAlerts() {
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)

	const [resetAlertOpen, setResetAlertOpen] = useAtom(isResetOpenAtom)
	const [restoreAlertOpen, setRestoreAlertOpen] = useAtom(isRestoreOpenAtom)
	const [toTrashAlertOpen, setToTrashAlertOpen] = useAtom(isToTrashOpenAtom)

	if (!productId || !productName) return null

	return (
		<>
			<ProductActionAlert
				title="Reset Product"
				description={`You're going to discard unsaved changes and reset "${productName}" to latest saved data. This action cannot be undone.`}
				actionTitle="Reset"
				cancelTitle="Cancel"
				onAction={() => console.log('Product reset', productId)}
				open={resetAlertOpen}
				onOpenChange={setResetAlertOpen}
			/>
			<ProductActionAlert
				title="Unsaved Content Detected"
				description={`You're going to restore "${productName}" to its last unsaved state. This action will discard current unsaved changes.`}
				actionTitle="Restore"
				cancelTitle="Cancel"
				onAction={() => console.log('Product restored', productId)}
				open={restoreAlertOpen}
				onOpenChange={setRestoreAlertOpen}
			/>
			<ProductActionAlert
				title="Move Product to Trash"
				description={`You're going to move "${productName}" to the trash. You can restore from Trash within 30 days.`}
				actionTitle="Delete"
				cancelTitle="Cancel"
				onAction={() => console.log('Product to trash', productId)}
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
	cancelTitle,
	onAction,
	onCancel,
	children,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	actionTitle: string
	cancelTitle: string
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
