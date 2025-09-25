import { useState } from 'react'

import { DropdownMenuRadioItem } from '@radix-ui/react-dropdown-menu'
import { useEditorState } from '@tiptap/react'
import { useAtom } from 'jotai'
import { ChevronDown } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Skeleton } from '~/components/ui/skeleton'

import { editorAtom } from '../../../context'
import { TooltipWrapper } from '../components/tooltip-wrapper'
import { type EditOptionProps } from '../edit-options'

export function SelectDropdownMenu({
	options,
	tooltip = 'Select options',
	side = 'bottom',
}: {
	options: EditOptionProps[]
	tooltip?: string
	side?: 'top' | 'right' | 'bottom' | 'left'
}) {
	const [editor] = useAtom(editorAtom)
	const [open, setOpen] = useState(false)

	const ActiveIcon = useEditorState({
		editor,
		selector: ctx => {
			const { editor } = ctx
			const fallback = options[0].icon
			if (!editor) return fallback // Default icon if editor is not available

			const activeOption = options.find(o => o.isActive?.(editor))
			return activeOption?.icon || fallback
		},
	})

	/**
	 * The selector function allows you to specify which parts of the editor state you want to subscribe to.
	 * @see https://tiptap.dev/docs/guides/performance#use-useeditorstate-to-prevent-unnecessary-re-renders
	 */
	useEditorState({
		editor,
		selector: ctx => {
			const { editor } = ctx
			if (!editor) return

			return options.map(o => o.canRun(editor))
		},
	})

	if (!editor) return <Skeleton className="size-8" />

	return (
		<DropdownMenu
			open={open}
			onOpenChange={open => {
				setOpen(open)
				if (!open) editor.chain().focus().run()
			}}
		>
			<TooltipWrapper tooltip={tooltip} side={side}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size={'sm'}
						className="gap-0 has-[>svg]:pr-0.5 has-[>svg]:pl-1.5"
					>
						{ActiveIcon && <ActiveIcon />} <ChevronDown className="scale-75" />
					</Button>
				</DropdownMenuTrigger>
			</TooltipWrapper>
			<DropdownMenuContent
				className="bg-background"
				onCloseAutoFocus={e => e.preventDefault()}
			>
				<DropdownMenuRadioGroup className="flex flex-col">
					{options.map(
						({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
							<TooltipWrapper
								key={index}
								tooltip={name}
								shortcut={shortcut}
								side="right"
							>
								<DropdownMenuRadioItem value={name} asChild>
									<Button
										variant="ghost"
										size={'sm'}
										disabled={!canRun(editor)}
										onClick={() => run(editor)}
										className={`justify-start ${isActive?.(editor) ? 'bg-accent' : ''}`}
									>
										<Icon className="size-4" />
										{name}
									</Button>
								</DropdownMenuRadioItem>
							</TooltipWrapper>
						),
					)}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
