import { atom, useAtomValue, useSetAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'

import { ProductStatus, ProductVisibility } from '../../../../lib/db/schema'
import { productAtom } from '../../../../store/product/context'

const productStatusAtom = atom(get => get(productAtom)?.status || null)
const productPublishedAtAtom = atom(
	get => get(productAtom)?.publishedAt || null,
)
const productVisibilityAtom = atom(get => get(productAtom)?.visibility || null)
const productPasswordAtom = atom(get => get(productAtom)?.password || null)

export function Publishing() {
	const setProduct = useSetAtom(productAtom)
	const productStatus = useAtomValue(productStatusAtom)
	const productPublishedAt = useAtomValue(productPublishedAtAtom)
	const productVisibility = useAtomValue(productVisibilityAtom)
	const productPassword = useAtomValue(productPasswordAtom)

	const handleProductChange = (
		updatedProduct: Partial<typeof productAtom.read>,
	) => {
		setProduct(prev => {
			if (!prev) return prev
			return { ...prev, ...updatedProduct }
		})
	}

	return (
		<Card id="publishing">
			<CardHeader>
				<CardTitle>Publishing</CardTitle>
				<CardDescription>Control product status and visibility</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Field>
					<FieldLabel htmlFor="p-status">Status</FieldLabel>
					<Select
						value={productStatus || ProductStatus[0]}
						onValueChange={value =>
							handleProductChange({
								status: value as ProductStatus,
							})
						}
					>
						<SelectTrigger id="p-status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ProductStatus.map(status => (
								<SelectItem key={status} value={status}>
									{status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				{productStatus === 'SCHEDULED' && (
					<Field>
						<FieldLabel htmlFor="p-published-at">
							Publish Date & Time
						</FieldLabel>
						<Input
							id="p-published-at"
							type="datetime-local"
							value={
								productPublishedAt
									? new Date(productPublishedAt).toISOString().slice(0, 16)
									: ''
							}
							onChange={e =>
								handleProductChange({
									publishedAt: e.target.value
										? new Date(e.target.value).toISOString()
										: null,
								})
							}
						/>
						<FieldDescription>
							Schedule when this product goes live
						</FieldDescription>
					</Field>
				)}

				<Separator />

				<Field>
					<FieldLabel htmlFor="p-visibility">Visibility</FieldLabel>
					<Select
						value={productVisibility || ProductVisibility[0]}
						onValueChange={value =>
							handleProductChange({
								visibility: value as ProductVisibility,
							})
						}
					>
						<SelectTrigger id="p-visibility">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ProductVisibility.map(visibility => (
								<SelectItem key={visibility} value={visibility}>
									{visibility}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				{productVisibility === 'PROTECTED' && (
					<Field>
						<FieldLabel htmlFor="p-password">Password</FieldLabel>
						<Input
							id="p-password"
							name="password"
							type="password"
							placeholder="Enter protection password"
							value={productPassword || ''}
							onChange={e => handleProductChange({ password: e.target.value })}
						/>
						<FieldDescription>
							Required password to view this product
						</FieldDescription>
					</Field>
				)}
			</CardContent>
		</Card>
	)
}
