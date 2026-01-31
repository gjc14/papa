import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useEditorState } from '@tiptap/react'
import { atom, useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Circle, ExternalLink, Link, Trash } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { Skeleton } from '~/components/ui/skeleton'

import { editorAtom } from '../../../context'
import { createLinkUnlinkOption } from '../edit-options'
import { TooltipWrapper } from './tooltip-wrapper'

export const isLinkUnlinkOpenAtom = atom(false)

export const LinkUnlinkButtons = () => {
	const LINK_UNKINK_SHORTCUT = createLinkUnlinkOption().shortcut
	const [linkInput, setLinkInput] = useState('')

	useHydrateAtoms([[isLinkUnlinkOpenAtom, false]])
	const [editor] = useAtom(editorAtom)
	const [isLinkUnlinkOpen, setIsLinkUnlinkOpen] = useAtom(isLinkUnlinkOpenAtom)

	/**
	 * The selector function allows you to specify which parts of the editor state you want to subscribe to.
	 * @see https://tiptap.dev/docs/guides/performance#use-useeditorstate-to-prevent-unnecessary-re-renders
	 */
	const linkStates = useEditorState({
		editor,
		selector: ctx => {
			const { editor } = ctx
			if (!editor) return

			return {
				isActive: createLinkUnlinkOption().isActive(editor),
				canRun: createLinkUnlinkOption(linkInput).canRun(editor),
			}
		},
	})

	const isActive = linkStates?.isActive
	const canRun = linkStates?.canRun

	// Open link/unlink input
	useHotkeys(
		LINK_UNKINK_SHORTCUT,
		e => {
			setIsLinkUnlinkOpen(prev => !prev)
			e.preventDefault()
		},
		{
			enabled: canRun,
			enableOnContentEditable: true,
			enableOnFormTags: true,
		},
	)

	if (!editor) return <Skeleton className="size-8" />

	const setLink = () => {
		try {
			if (!linkInput) {
				return unsetLink()
			}
			editor.chain().focus().setLink({ href: linkInput }).run()
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error unsetting link:', error.message)
			} else {
				console.error('Unexpected error unsetting link:', error)
			}
		}
	}

	const unsetLink = () => editor.chain().focus().unsetLink().run()

	const handleOpenLink = () => {
		if (!linkInput) return

		window.open(linkInput, '_blank', 'noopener,noreferrer')
	}

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			setLink()
		}
	}

	return (
		<Popover
			open={isLinkUnlinkOpen}
			onOpenChange={open => {
				setIsLinkUnlinkOpen(open)
				if (!editor) return

				if (open) {
					const { href } = editor.getAttributes('link')
					setLinkInput(href || '')
				} else {
					editor.commands.focus()
				}
			}}
		>
			<TooltipWrapper tooltip="Link / Unlink" shortcut={LINK_UNKINK_SHORTCUT}>
				<PopoverTrigger asChild>
					<Button
						size={'icon'}
						variant={'ghost'}
						className={`h-8 w-8 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
						disabled={!canRun}
					>
						<Link size={14} />
					</Button>
				</PopoverTrigger>
			</TooltipWrapper>
			<PopoverContent className="flex w-80 items-center rounded-full p-0.5">
				<div className="relative flex-1">
					<Input
						id="link"
						type="text"
						placeholder="https://example.com"
						className="rounded-full border-2 pr-8 focus:ring-2 focus:ring-offset-2"
						value={linkInput}
						onChange={e => setLinkInput(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-1/2 right-1 size-7 -translate-y-1/2 rounded-full"
						onClick={() => {
							setLink()
							setIsLinkUnlinkOpen(false)
						}}
					>
						<Circle />
					</Button>
				</div>

				{/* Separator */}
				<div className="bg-border mx-2 my-1 w-px self-stretch" />

				<TooltipWrapper tooltip="Unset Link">
					<Button
						variant="ghost"
						size={'icon'}
						className="rounded-full"
						onClick={unsetLink}
					>
						<Trash />
					</Button>
				</TooltipWrapper>
				<TooltipWrapper tooltip="Open Link in New Tab">
					<Button
						variant="ghost"
						size={'icon'}
						className="rounded-full"
						onClick={handleOpenLink}
					>
						<ExternalLink />
					</Button>
				</TooltipWrapper>
			</PopoverContent>
		</Popover>
	)
}
