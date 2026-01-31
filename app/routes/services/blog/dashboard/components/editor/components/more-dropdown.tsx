import { useEditorState } from '@tiptap/react'
import { useAtom } from 'jotai'
import { MoreVertical } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Skeleton } from '~/components/ui/skeleton'

import { editorAtom } from '../../../context'
import { type EditOptionProps } from '../edit-options'
import { TooltipWrapper } from './tooltip-wrapper'

export function MoreDropdownMenu({ options }: { options: EditOptionProps[] }) {
	const [editor] = useAtom(editorAtom)

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
			<TooltipWrapper
				tooltip="More options"
				render={
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size={'sm'}
								onClick={e => e.isDefaultPrevented()}
							>
								<MoreVertical />
							</Button>
						}
					/>
				}
			/>
			<DropdownMenuContent className="bg-background">
				{options.map(
					({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
						<TooltipWrapper
							key={index}
							tooltip={name}
							shortcut={shortcut}
							side="right"
							render={
								<DropdownMenuItem
									render={
										<Button
											variant="ghost"
											size={'sm'}
											disabled={!canRun(editor)}
											onClick={() => run(editor)}
											className={`w-full justify-start ${isActive?.(editor) ? 'bg-accent' : ''}`}
										>
											<Icon className="size-4" />
											{name}
										</Button>
									}
								/>
							}
						/>
					),
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
