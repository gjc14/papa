import { useCallback } from 'react'
import { Link, useFetcher } from 'react-router'

import { atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import { ExternalLink } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'

import { productAtom, storeConfigAtom } from '../../../../store/product/context'
import { isResetAlertOpenAtom, livePreviewAtom } from '../context'
import type { action } from '../resource'

const productIdAtom = atom(get => get(productAtom)?.id || null)
const productNameAtom = atom(get => get(productAtom)?.name || null)
const productSlugAtom = atom(get => get(productAtom)?.slug || null)

export function ProductEditPageHeader() {
	const fetcher = useFetcher<typeof action>()

	const store = useStore()
	const [preview, setPreview] = useAtom(livePreviewAtom)
	const storeConfig = useAtomValue(storeConfigAtom)
	const productId = useAtomValue(productIdAtom)
	const productName = useAtomValue(productNameAtom)
	const productSlug = useAtomValue(productSlugAtom)
	const setResetOpen = useSetAtom(isResetAlertOpenAtom)

	if (!productId || !productName || !productSlug) return null

	const handleSave = useCallback(() => {
		const product = store.get(productAtom)
		if (!product) return

		const payload = JSON.stringify(product, (_, v) =>
			typeof v === 'bigint' ? v.toString() : v,
		)
		fetcher.submit(payload, {
			method: 'post',
			action: 'resource', // :productSlug/resource route is where the action is defined
			encType: 'application/json',
		})
	}, [store])

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
					<Switch id="preview" checked={preview} onCheckedChange={setPreview} />
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
					<Button
						size="sm"
						variant="outline"
						type="button"
						onClick={() => setResetOpen(true)}
					>
						Reset
					</Button>
					<Button
						size="sm"
						type="submit"
						form="product-edit-form"
						onClick={handleSave}
					>
						Save
					</Button>
				</div>
			</div>
		</header>
	)
}
