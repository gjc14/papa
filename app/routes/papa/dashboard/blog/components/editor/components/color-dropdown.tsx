import { DropdownMenuRadioItem } from '@radix-ui/react-dropdown-menu'
import { Editor, useEditorState } from '@tiptap/react'
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
import type { EditOptionProps } from '../edit-options'

const activeIndicatorStyles =
	(indicator: ActiveIndicator) =>
	(color: string): React.CSSProperties => {
		switch (indicator) {
			case 'background':
				return { backgroundColor: color }
			case 'text':
				return { color }
		}
	}

type ActiveIndicator = 'background' | 'text'

export function ColorDropdownMenu({
	icon,
	activeIndicator = 'text',
	options,
	canRemove,
	onRemove,
	tooltip = 'Color options',
	side = 'bottom',
	displayText = true,
}: {
	icon: React.ReactNode
	activeIndicator?: ActiveIndicator
	options: (EditOptionProps & {
		color: string
	})[]
	canRemove?: (editor: Editor) => boolean
	onRemove?: (editor: Editor) => void
	tooltip?: string
	side?: 'top' | 'right' | 'bottom' | 'left'
	displayText?: boolean
}) {
	const [editor] = useAtom(editorAtom)

	const activeColor = useEditorState({
		editor,
		selector: ctx => {
			const { editor } = ctx
			if (!editor) return null

			return options.find(o => o.isActive?.(editor)) || null
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
		<DropdownMenu>
			<TooltipWrapper tooltip={tooltip} side={side}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size={'sm'}
						className="gap-0 has-[>svg]:pr-0.5 has-[>svg]:pl-1.5"
						style={
							activeColor
								? activeIndicatorStyles(activeIndicator)(activeColor.color)
								: undefined
						}
					>
						{icon}
						<ChevronDown className="scale-75" />
					</Button>
				</DropdownMenuTrigger>
			</TooltipWrapper>
			<DropdownMenuContent className="bg-background max-w-[90vw]">
				<DropdownMenuRadioGroup className="grid grid-cols-[repeat(5,1fr)] justify-center gap-0.5 p-1">
					{options.map(({ name, run, canRun, isActive, color }, index) => (
						<TooltipWrapper key={index} tooltip={name} side="top">
							<DropdownMenuRadioItem value={name} asChild>
								<button
									disabled={isActive?.(editor) || !canRun(editor)}
									onClick={() => run(editor)}
									className="hover:bg-primary/20 m-0.5 w-fit cursor-pointer overflow-hidden rounded-full border p-0.75 disabled:cursor-not-allowed"
								>
									{displayText ? (
										<div
											className="grid size-5 place-items-center rounded-full text-xs"
											style={{ backgroundColor: color }}
										>
											A
										</div>
									) : (
										<div
											className="size-5 rounded-full"
											style={{ backgroundColor: color }}
										/>
									)}
								</button>
							</DropdownMenuRadioItem>
						</TooltipWrapper>
					))}

					{/* Remove color */}
					<TooltipWrapper tooltip="Remove color" side="top">
						<DropdownMenuRadioItem value={'remove'} asChild>
							<button
								disabled={!canRemove?.(editor)}
								onClick={() => onRemove?.(editor)}
								className="hover:bg-primary/20 m-0.5 w-fit cursor-pointer overflow-hidden rounded-full border p-0.75 disabled:cursor-not-allowed"
							>
								<div className="relative size-5 rounded-full border-[3px] border-gray-500 p-0.5">
									<div className="absolute top-0 left-0 h-full w-full rotate-45">
										<div className="absolute top-1/2 left-1/2 h-[3px] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-gray-500" />
									</div>
								</div>
							</button>
						</DropdownMenuRadioItem>
					</TooltipWrapper>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
