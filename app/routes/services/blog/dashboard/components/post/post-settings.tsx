import { useAtom } from 'jotai'
import { X } from 'lucide-react'

import { Separator } from '~/components/ui/separator'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '~/components/ui/sheet'
import { useIsMobile } from '~/hooks/use-mobile'

import { isSettingsOpenAtom } from '../../context'
import { DangerZone } from './danger-zone'
import { PostMetaPart } from './post-meta-part'
import { SeoPart } from './seo-part'
import { TaxonomyPart } from './taxonomy-part'

export const PostSettings = () => {
	const [open, setOpen] = useAtom(isSettingsOpenAtom)

	const isMobile = useIsMobile()

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent
				className={`overflow-y-scroll pt-0 ${isMobile ? 'max-h-9/10' : ''}`}
				side={isMobile ? 'bottom' : 'right'}
				showCloseButton={false}
			>
				<SheetHeader className="supports-[backdrop-filter]:bg-primary-foreground/80 bg-primary-foreground sticky top-0 flex-row items-center justify-between space-y-0 py-3 backdrop-blur-xs">
					<SheetTitle>Edit Post</SheetTitle>
					<SheetDescription>
						<SheetClose className="cursor-pointer">
							<X className="size-5" />
						</SheetClose>
					</SheetDescription>
				</SheetHeader>

				<SettingsForm />
			</SheetContent>
		</Sheet>
	)
}

const SettingsForm = () => {
	return (
		<section className="flex w-full grow flex-col gap-5 px-3 pb-6">
			<PostMetaPart />
			<Separator />
			<TaxonomyPart />
			<Separator />
			<SeoPart />

			<DangerZone />
		</section>
	)
}
