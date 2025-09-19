import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useEditorState } from '@tiptap/react'
import { atom, useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Image } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { isValidUrl } from '~/lib/utils'

import { editorAtom } from '../../../context'
import { createImageOption } from '../edit-options'
import { TooltipWrapper } from './tooltip-wrapper'

export const isImageSelectorOpenAtom = atom(false)

export const IMAGE_SHORTCUT = 'mod+shift+i'

export const ImageButton = () => {
	const [srcInput, setSrcInput] = useState('')
	const [altInput, setAltInput] = useState('')
	const [titleInput, setTitleInput] = useState('')

	useHydrateAtoms([[isImageSelectorOpenAtom, false]])

	const [editor] = useAtom(editorAtom)
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useAtom(
		isImageSelectorOpenAtom,
	)

	/**
	 * The selector function allows you to specify which parts of the editor state you want to subscribe to.
	 * @see https://tiptap.dev/docs/guides/performance#use-useeditorstate-to-prevent-unnecessary-re-renders
	 */
	const imageStates = useEditorState({
		editor,
		selector: ctx => {
			const { editor } = ctx
			if (!editor) return

			// log to help debug whether the selector thinks the command can run / is active
			const opt = createImageOption({ src: srcInput })
			const isActive = opt.isActive(editor)
			const canRun = opt.canRun(editor)
			return { isActive, canRun }
		},
	})

	const isActive = imageStates?.isActive
	const canRun = imageStates?.canRun

	// Open Image selector
	useHotkeys(
		IMAGE_SHORTCUT,
		e => {
			setIsImageSelectorOpen(prev => !prev)
			e.preventDefault()
			e.stopPropagation()
		},
		{
			enabled: canRun,
			enableOnContentEditable: true,
			enableOnFormTags: true,
		},
	)

	const setSrc = () => {
		try {
			if (!srcInput || !editor) return
			editor
				.chain()
				.focus()
				.setImage({ src: srcInput, alt: altInput, title: titleInput })
				.run()
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error unsetting image:', error.message)
			} else {
				console.error('Unexpected error unsetting image:', error)
			}
		}
	}

	const insertAvailable = isValidUrl(srcInput) && canRun

	return (
		<Dialog
			open={isImageSelectorOpen}
			onOpenChange={open => {
				setIsImageSelectorOpen(open)
				if (open && editor) {
					const { src } = editor.getAttributes('image')
					setSrcInput(src || '')
				}
			}}
		>
			<TooltipWrapper tooltip="Image" shortcut={IMAGE_SHORTCUT}>
				<DialogTrigger asChild>
					<Button
						size={'icon'}
						variant={'ghost'}
						className={`h-8 w-8 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
						disabled={!canRun}
					>
						<Image size={14} />
					</Button>
				</DialogTrigger>
			</TooltipWrapper>
			<DialogContent>
				<DialogTitle hidden>Add Image</DialogTitle>
				<DialogDescription hidden></DialogDescription>
				<div className="flex flex-col items-center gap-2">
					<div className="flex h-40 w-full items-center justify-center border">
						{insertAvailable ? (
							<img
								src={srcInput}
								alt={altInput}
								title={titleInput}
								className={`max-h-40 object-contain`}
							/>
						) : (
							<>🍌</>
						)}
					</div>

					<div className="w-full">
						<Label htmlFor="image-src">Image URL *</Label>
						<Input
							id="image-src"
							value={srcInput}
							onChange={e => setSrcInput(e.target.value)}
							placeholder="https://example.com/image.webp"
						/>
					</div>

					<div className="w-full">
						<Label htmlFor="image-alt">Image Alt Text </Label>
						<Input
							id="image-alt"
							value={altInput}
							onChange={e => setAltInput(e.target.value)}
							placeholder="My Image Alt Text"
						/>
					</div>

					<div className="w-full">
						<Label htmlFor="image-title">Image Title </Label>
						<Input
							id="image-title"
							value={titleInput}
							onChange={e => setTitleInput(e.target.value)}
							placeholder="My Image"
						/>
					</div>

					<DialogClose asChild>
						<Button
							onClick={setSrc}
							className="w-full"
							disabled={!insertAvailable}
						>
							Insert
						</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	)
}
