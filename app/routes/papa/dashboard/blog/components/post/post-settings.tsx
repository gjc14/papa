import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { X } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/ui/sheet'
import { useIsMobile } from '~/hooks/use-mobile'

import { isSettingsOpenAtom } from '../../context'
import { DangerZone } from './danger-zone'
import { PostMetaPart } from './post-meta-part'
import { SeoPart } from './seo-part'
import { TaxonomyPart } from './taxonomy-part'

export const PostSettings = () => {
	useHydrateAtoms([[isSettingsOpenAtom, false]])

	const [open, setOpen] = useAtom(isSettingsOpenAtom)

	const isMobile = useIsMobile()

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent
				className={`overflow-y-scroll pt-0 ${isMobile ? 'max-h-9/10' : ''}`}
				side={isMobile ? 'bottom' : 'right'}
				hideCloseButton
			>
				<SheetHeader className="bg-primary-foreground/80 sticky top-0 flex-row items-center justify-between space-y-0 py-3 backdrop-blur-xs">
					<SheetTitle>Edit Post</SheetTitle>
					<SheetDescription>
						<SheetClose className="cursor-pointer">
							<X className="size-5" />
						</SheetClose>
					</SheetDescription>
				</SheetHeader>
				<section className="px-3 pb-6">
					<SettingsForm />
				</section>
			</SheetContent>
		</Sheet>
	)
}

const SettingsForm = () => {
	return (
		<section className="flex w-full grow flex-col gap-5">
			<PostMetaPart />
			<Separator />
			<TaxonomyPart />
			<Separator />
			<SeoPart />

			<DangerZone />
		</section>
	)
}
