import { Link } from 'react-router'

import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ExternalLink } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'

import { productAtom, storeConfigAtom } from '../../../../store/product/context'

const productIdAtom = atom(get => get(productAtom)?.id || null)
const productNameAtom = atom(get => get(productAtom)?.name || null)
const productSlugAtom = atom(get => get(productAtom)?.slug || null)

export function ProductEditPageHeader({
	preview,
	onPreviewChange,
}: {
	preview: boolean
	onPreviewChange: (value: boolean) => void
}) {
	const setProduct = useSetAtom(productAtom)
	const storeConfig = useAtomValue(storeConfigAtom)
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)
	const productSlug = useAtomValue(productSlugAtom)

	if (!productId || !productName || !productSlug) return null

	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
			<div className="flex flex-wrap items-center justify-between gap-3 p-4">
				<div className="flex items-center gap-3">
					<h1 className="text-xl font-semibold">
						{productId !== -1 ? 'Edit' : 'Create'}: {productName}
					</h1>
					{productId !== -1 && ( // new products have id -1
						<span className="text-muted-foreground text-sm">
							ID: {productId}
						</span>
					)}
				</div>
				<div className="flex items-center gap-3">
					<Label htmlFor="preview" className="text-sm">
						Preview
					</Label>
					<Switch
						id="preview"
						checked={preview}
						onCheckedChange={onPreviewChange}
					/>
					<Button variant={'ghost'} size={'icon'} asChild className="size-8">
						<Link
							to={`${storeConfig.storeFrontPath}/product/${productSlug}`}
							target="_blank"
							rel="noreferrer"
						>
							<ExternalLink />
						</Link>
					</Button>
					<Separator orientation="vertical" className="h-6" />
					<Button size="sm" variant="outline" type="button">
						Restore
					</Button>
					<Button size="sm" type="submit" form="product-edit-form">
						Save
					</Button>
				</div>
			</div>
		</header>
	)
}
