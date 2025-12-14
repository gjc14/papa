import { useState } from 'react'

import { useEditorState } from '@tiptap/react'
import { atom, useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ExternalLink } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { Skeleton } from '~/components/ui/skeleton'

import { editorAtom } from '../../../context'
import {
	createYoutubeOption,
	type SetYoutubeVideoOptions,
} from '../edit-options'
import { TooltipWrapper } from './tooltip-wrapper'

export const isYoutubeOpenAtom = atom(false)
const YoutubeIcon = createYoutubeOption().icon

export const YoutubeButton = () => {
	const [options, setOptions] = useState<SetYoutubeVideoOptions>({
		src: '',
	})
	const [isInsert, setIsInsert] = useState(true)

	useHydrateAtoms([[isYoutubeOpenAtom, false]])
	const [editor] = useAtom(editorAtom)
	const [isYoutubeOpen, setIsYoutubeOpen] = useAtom(isYoutubeOpenAtom)

	/**
	 * The selector function allows you to specify which parts of the editor state you want to subscribe to.
	 * @see https://tiptap.dev/docs/guides/performance#use-useeditorstate-to-prevent-unnecessary-re-renders
	 */
	const ytStates = useEditorState({
		editor,
		selector: ctx => {
			const { editor } = ctx
			if (!editor) return

			// setYoutubeVideo has a stric check if src is a valid youtube url
			const runDisplay = createYoutubeOption({
				...options,
				src: options.src || 'https://youtube.com/watch?v=placeholder',
			})
			const runInsert = createYoutubeOption(options)

			const isActive = runDisplay.isActive(editor)
			const canRun = runDisplay.canRun(editor)
			const canInsert = runInsert.canRun(editor)
			return { isActive, canRun, canInsert }
		},
	})

	const isActive = ytStates?.isActive
	const canRun = ytStates?.canRun
	const canInsert = ytStates?.canInsert

	if (!editor) return <Skeleton className="size-8" />

	const insertYoutubeVideo = () => {
		try {
			if (!canInsert) return

			editor.commands.setYoutubeVideo({
				src: options.src,
				width: options.width,
				...(options.height ? { height: options.height } : {}),
				...(options.start ? { start: options.start } : {}),
			})
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error unsetting link:', error.message)
			} else {
				console.error('Unexpected error unsetting link:', error)
			}
		}
	}

	const handleOpenYoutube = () => {
		if (!canInsert) return

		window.open(options.src, '_blank', 'noopener,noreferrer')
	}

	return (
		<Popover
			open={isYoutubeOpen}
			onOpenChange={open => {
				setIsYoutubeOpen(open)

				if (open) {
					const attr = editor.getAttributes('youtube')
					if (Object.keys(attr).length === 0) {
						setIsInsert(true)
						setOptions({ src: '' })
					} else {
						setIsInsert(false)
						if (attr.width === '100%') {
							// convert back to number for input value
							attr.width = undefined
						}
						setOptions(attr as SetYoutubeVideoOptions)
					}
				} else {
					editor.commands.focus()
				}
			}}
		>
			<TooltipWrapper tooltip="Youtube">
				<PopoverTrigger asChild>
					<Button
						size={'icon'}
						variant={'ghost'}
						className={`h-8 w-8 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
						disabled={!canRun}
					>
						<YoutubeIcon />
					</Button>
				</PopoverTrigger>
			</TooltipWrapper>
			<PopoverContent className="flex w-80 flex-col gap-2 rounded-xl px-4 py-3">
				<div className="w-full">
					<Label htmlFor="yt-src">URL *</Label>
					<Input
						id="yt-src"
						value={options.src}
						onChange={e =>
							setOptions(prev => ({ ...prev, src: e.target.value }))
						}
						placeholder="https://youtube.com/..."
					/>
				</div>

				<div className="w-full">
					<Label htmlFor="yt-width">Fixed width</Label>
					<Input
						id="yt-width"
						value={options.width ?? ''}
						onChange={e =>
							setOptions(prev => {
								const value = Number(e.target.value)
								return {
									...prev,
									width: value && !Number.isNaN(value) ? value : undefined,
								}
							})
						}
						placeholder="auto"
					/>
				</div>

				<div className="w-full">
					<Label htmlFor="yt-height">Fixed height</Label>
					<Input
						id="yt-height"
						value={options.height ?? ''}
						onChange={e =>
							setOptions(prev => {
								const value = Number(e.target.value)
								return {
									...prev,
									height: value && !Number.isNaN(value) ? value : undefined,
								}
							})
						}
						placeholder="360"
					/>
				</div>

				<div className="w-full">
					<Label htmlFor="yt-start">Start (seconds)</Label>
					<Input
						id="yt-start"
						value={options.start ?? ''}
						onChange={e =>
							setOptions(prev => {
								const value = Number(e.target.value)
								return {
									...prev,
									start: value && !Number.isNaN(value) ? value : undefined,
								}
							})
						}
						placeholder="0"
					/>
				</div>

				<div className="flex w-full items-center gap-2 pt-2">
					<TooltipWrapper tooltip="Insert Youtube Video">
						<Button
							className="flex-1"
							onClick={() => {
								insertYoutubeVideo()
								setIsYoutubeOpen(false)
							}}
							disabled={!canInsert}
						>
							{isInsert ? 'Insert' : 'Update'}
						</Button>
					</TooltipWrapper>
					<TooltipWrapper tooltip="Open Youtube in New Tab">
						<Button
							variant="ghost"
							size={'icon'}
							onClick={handleOpenYoutube}
							disabled={!canInsert}
						>
							<ExternalLink />
						</Button>
					</TooltipWrapper>
				</div>
			</PopoverContent>
		</Popover>
	)
}
