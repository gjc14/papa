import { Editor, useEditorState } from '@tiptap/react'
import { useAtom } from 'jotai'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'

import { editorAtom } from '../../../context'
import { TooltipWrapper } from './tooltip-wrapper'

interface ToggleButtonProps {
	children: React.ReactNode
	tooltip: string
	shortcut?: string
	isActive?: (editor: Editor) => boolean
	run: (editor: Editor) => void
	canRun: (editor: Editor) => boolean
	asChild?: boolean
	className?: string
}

/** Toggle button only renders when disabled / isActive status changes */
export function ToggleButton(props: ToggleButtonProps) {
	const [editor] = useAtom(editorAtom)

	const isActive = useEditorState({
		editor,
		selector: ctx => ctx.editor && props.isActive?.(ctx.editor),
	})

	const canRun = useEditorState({
		editor,
		selector: ctx => ctx.editor && props.canRun(ctx.editor),
	})

	if (!editor) return <Skeleton className="size-8" />

	return (
		<TooltipWrapper tooltip={props.tooltip} shortcut={props.shortcut}>
			<Button
				variant="ghost"
				size="icon"
				aria-label={props.tooltip}
				className={cn(
					'size-8',
					isActive ? 'bg-accent text-accent-foreground' : '',
					props.className,
				)}
				disabled={!canRun}
				onClick={() => props.run(editor)}
				asChild={props.asChild}
			>
				{props.children}
			</Button>
		</TooltipWrapper>
	)
}
