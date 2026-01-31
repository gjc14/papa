import { useState } from 'react'

import { Plus } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Spinner } from '~/components/ui/spinner'
import { generateSlug } from '~/lib/utils/seo'

interface CreateTaxonomyPopoverProps {
	/** Display name for the taxonomy type (e.g., 'Category', 'Brand') */
	taxonomyType: 'Category' | 'Brand'
	/** Available parent options (only top-level items without children) */
	parentOptions: Array<{ id: number; name: string }>
	/** Callback when create */
	onCreate: (data: {
		name: string
		slug: string
		parentId: number | null
	}) => void
	/** Submit state */
	isSubmitting: boolean
}

export function CreateTaxonomyPopover({
	taxonomyType,
	parentOptions,
	onCreate,
	isSubmitting,
}: CreateTaxonomyPopoverProps) {
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [parentId, setParentId] = useState<string | null>(null)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (isSubmitting || !name.trim()) return

		onCreate({
			name: name.trim(),
			slug: generateSlug(name, {
				fallbackPrefix: `new-${taxonomyType.toLowerCase()}`,
			}),
			parentId: parentId ? Number(parentId) : null,
		})

		// Reset form
		setName('')
		setParentId(null)
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="outline"
						size="sm"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? <Spinner /> : <Plus />}
						{taxonomyType}
					</Button>
				}
			/>
			<PopoverContent className="w-80">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<h4 className="leading-none font-medium">Create {taxonomyType}</h4>
						<p className="text-muted-foreground text-sm">
							Add a new {taxonomyType.toLowerCase()} to your catalog
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							placeholder={`${taxonomyType} name`}
							value={name}
							onChange={e => setName(e.target.value)}
							autoFocus
						/>
					</div>
					{parentOptions.length > 0 && (
						<div className="space-y-2">
							<Label htmlFor="parent">Parent (Optional) {parentId}</Label>
							<Select value={parentId} onValueChange={v => setParentId(v)}>
								<SelectTrigger id="parent" className="w-full">
									<SelectValue
										placeholder={`None (Top-level ${taxonomyType.toLowerCase()})`}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={null}>
										None (Top-level {taxonomyType.toLowerCase()})
									</SelectItem>
									<SelectSeparator />
									{parentOptions.map(option => (
										<SelectItem key={option.id} value={String(option.id)}>
											{option.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							className="flex-1"
							disabled={!name.trim() || isSubmitting}
						>
							{isSubmitting && <Spinner />}
							Create {taxonomyType}
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	)
}
