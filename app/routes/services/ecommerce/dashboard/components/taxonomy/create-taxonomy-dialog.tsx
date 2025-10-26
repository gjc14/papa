import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'

import { CheckCircle2, Plus } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { Spinner } from '~/components/ui/spinner'
import { Textarea } from '~/components/ui/textarea'
import { useFetcherNotification } from '~/hooks/use-notification'
import type { ActionResponse } from '~/lib/utils'

import type { Brand } from '../../02_products/03_brands/route'
import type { Category } from '../../02_products/04_categories/route'
import type { Tag } from '../../02_products/05_tags/route'
import type { Attribute } from '../../02_products/06_attributes/route'

type TaxonomyItem = Brand | Category | Tag | Attribute

type TaxonomyConfig = {
	/** The name of the taxonomy (e.g., "Category", "Brand", "Tag", "Attribute") */
	name: string
	/** The plural name of the taxonomy (e.g., "Categories", "Brands", "Tags", "Attributes") */
	pluralName: string
	/** The action endpoint for the resource route */
	actionEndpoint: string
	/** Whether to show the parent selection field */
	hasParent?: boolean
	/** Whether to show the image URL field */
	hasImage?: boolean
	/** Whether to show the description field (for attributes) */
	hasDescription?: boolean
	/** Whether to show the value field (for attributes) */
	hasValue?: boolean
	/** Placeholder for the name field */
	namePlaceholder?: string
	/** Placeholder for the slug field */
	slugPlaceholder?: string
}

type CreateTaxonomyDialogProps = {
	data: TaxonomyItem[]
	config: TaxonomyConfig
}

/**
 * # Basic Usage
 *
 * ```tsx
 * import { CreateTaxonomyDialog } from '~/routes/services/ecommerce/dashboard/components/taxonomy/create-taxonomy-dialog'
 * import type { action } from './resource'
 *
 * <CreateTaxonomyDialog<Awaited<ReturnType<typeof action>>>
 *   data={yourData}
 *   config={{
 *   	name: 'Category',
 *   	pluralName: 'Categories',
 *   	actionEndpoint: 'resource',
 *   	hasDescription: true,
 * 	 	hasParent: true,
 *   	hasImage: true,
 *   }}
 * />
 * ```
 *
 * # Examples
 *
 * ## 1. Brands (parent and image)
 *
 * ```tsx
 * <CreateTaxonomyDialog<Awaited<ReturnType<typeof action>>>
 * 	data={brands}
 * 	config={{
 * 		name: 'Brand',
 * 		pluralName: 'Brands',
 * 		actionEndpoint: 'resource',
 * 		hasDescription: true,
 * 		hasParent: true,
 * 		hasImage: true,
 * 		namePlaceholder: 'Nike',
 * 		slugPlaceholder: 'nike',
 * 	}}
 * />
 * ```
 *
 * ## 2. Tags (image)
 *
 * ```tsx
 * <CreateTaxonomyDialog<Awaited<ReturnType<typeof action>>>
 * 	data={tags}
 * 	config={{
 * 		name: 'Tag',
 * 		pluralName: 'Tags',
 * 		actionEndpoint: 'resource',
 * 		hasDescription: true,
 * 		hasImage: true,
 * 		namePlaceholder: 'Featured',
 * 		slugPlaceholder: 'featured',
 * 	}}
 * />
 * ```
 *
 * ## 3. Attributes (value & no description/parent/image)
 *
 * ```tsx
 * <CreateTaxonomyDialog<Awaited<ReturnType<typeof action>>>
 * 	data={attributes}
 * 	config={{
 *		name: 'Attribute',
 *		pluralName: 'Attributes',
 *		actionEndpoint: 'resource',
 *		hasValue: true,
 *		namePlaceholder: 'Featured',
 *		slugPlaceholder: 'featured',
 * 	}}
 * />
 * ```
 */
export function CreateTaxonomyDialog<T extends ActionResponse | undefined>({
	data,
	config = {
		name: 'Item',
		pluralName: 'Items',
		actionEndpoint: 'resource',
		hasDescription: false,
		hasParent: false,
		hasImage: false,
		hasValue: false,
		namePlaceholder: undefined,
		slugPlaceholder: undefined,
	},
}: CreateTaxonomyDialogProps) {
	const fetcher = useFetcher<T>()
	const { mutating } = useFetcherNotification(fetcher, {
		preventSuccessAlert: true,
	})
	const formRef = useRef<HTMLFormElement>(null)
	const [open, setOpen] = useState(false)
	const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
		undefined,
	)
	const [showSuccess, setShowSuccess] = useState(false)

	useEffect(() => {
		if (!mutating && fetcher.data?.msg) {
			setShowSuccess(true)
		}
	}, [fetcher.state, fetcher.data])

	// Only top-level items can be parents
	const validParentItems = config.hasParent
		? data.filter(item => ('parentId' in item ? !item.parentId : true))
		: []

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)

		const taxonomyData: Record<string, any> = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
		}

		// Add optional fields based on config
		if (config.hasDescription) {
			taxonomyData.description = (formData.get('description') as string) ?? null
		}

		if (config.hasImage) {
			taxonomyData.image = (formData.get('image') as string) ?? null
		}

		if (config.hasParent) {
			taxonomyData.parentId =
				selectedParentId && selectedParentId !== 'none'
					? Number(selectedParentId)
					: null
		}

		if (config.hasValue) {
			taxonomyData.value = (formData.get('value') as string) ?? null
		}

		fetcher.submit(taxonomyData, {
			method: 'post',
			action: config.actionEndpoint,
			encType: 'application/json',
		})
	}

	const handleReset = () => {
		formRef.current?.reset()
		setSelectedParentId(undefined)
		setShowSuccess(false)
	}

	const handleClose = () => {
		setOpen(false)
		// Reset the form after closing
		setTimeout(() => {
			handleReset()
		}, 200)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={o => {
				if (o) setShowSuccess(false)
				setOpen(o)
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus />
					Create {config.name}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Create New {config.name}</DialogTitle>
					<DialogDescription>
						Add a new {config.name.toLowerCase()} for your products. Fill in the
						required fields below.
					</DialogDescription>
				</DialogHeader>

				{showSuccess ? (
					<div className="space-y-4">
						<Alert>
							<CheckCircle2 className="h-4 w-4" />
							<AlertTitle>Success!</AlertTitle>
							<AlertDescription>
								{fetcher.data?.msg || `${config.name} created successfully`}
							</AlertDescription>
						</Alert>

						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={handleClose}
							>
								Close
							</Button>
							<Button className="flex-1" autoFocus onClick={handleReset}>
								Continue Adding
							</Button>
						</div>
					</div>
				) : (
					<form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
						<div>
							<Label htmlFor="name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								placeholder={
									config.namePlaceholder ||
									`Enter ${config.name.toLowerCase()} name`
								}
								required
								disabled={mutating}
								autoFocus
							/>
						</div>

						<div>
							<Label htmlFor="slug">
								Slug <span className="text-destructive">*</span>
							</Label>
							<Input
								id="slug"
								name="slug"
								placeholder={
									config.slugPlaceholder || `${config.name.toLowerCase()}-slug`
								}
								required
								disabled={mutating}
							/>
						</div>

						{config.hasDescription && (
							<div>
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									placeholder={`${config.name} description...`}
									rows={3}
									disabled={mutating}
								/>
							</div>
						)}

						{config.hasValue && (
							<div>
								<Label htmlFor="value">Value</Label>
								<Input
									id="value"
									name="value"
									placeholder='Seperate your values by "|"'
									disabled={mutating}
								/>
							</div>
						)}

						{config.hasImage && (
							<div>
								<Label htmlFor="image">Image URL</Label>
								<Input
									id="image"
									name="image"
									placeholder="https://example.com/image.jpg"
									disabled={mutating}
								/>
							</div>
						)}

						{config.hasParent && (
							<div>
								<Label htmlFor="parentId">Parent {config.name}</Label>
								<Select
									value={selectedParentId}
									onValueChange={setSelectedParentId}
									disabled={mutating}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={`None (Top-level ${config.name.toLowerCase()})`}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">
											None (Top-level {config.name.toLowerCase()})
										</SelectItem>
										{validParentItems.map(item => (
											<SelectItem key={item.id} value={item.id.toString()}>
												{item.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<Button type="submit" className="mt-3 w-full" disabled={mutating}>
							{mutating && <Spinner />}
							Create {config.name}
						</Button>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}
