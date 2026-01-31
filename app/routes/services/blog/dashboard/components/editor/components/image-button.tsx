import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useEditorState } from '@tiptap/react'
import { atom, useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Image } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { DialogTrigger } from '~/components/ui/dialog'
import { Skeleton } from '~/components/ui/skeleton'
import { AssetSelectionDialog } from '~/components/asset-selection-dialog'

import { editorAtom } from '../../../context'
import { useAssetsContext } from '../../../hooks'
import { createImageOption } from '../edit-options'
import { TooltipWrapper } from './tooltip-wrapper'

export const isImageSelectorOpenAtom = atom(false)

export const ImageButton = () => {
	const IMAGE_SHORTCUT = createImageOption({ src: '' }).shortcut

	const { filesContext, isLoading } = useAssetsContext()

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

	if (!editor) return <Skeleton className="size-8" />

	const handleInsert = () => {
		try {
			if (!srcInput) return
			editor
				.chain()
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

	return (
		<AssetSelectionDialog
			actionLabel="Insert"
			title="Image"
			trigger={
				<TooltipWrapper
					tooltip="Image"
					shortcut={IMAGE_SHORTCUT}
					render={
						<DialogTrigger
							render={
								<Button
									size={'icon'}
									variant={'ghost'}
									className={`h-8 w-8 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
									disabled={!canRun}
								>
									<Image />
								</Button>
							}
						/>
					}
				/>
			}
			assets={filesContext}
			isLoading={isLoading}
			open={isImageSelectorOpen}
			onOpenChange={open => {
				setIsImageSelectorOpen(open)

				if (open) {
					const { src, alt, title } = editor.getAttributes('image')
					setSrcInput(src || '')
					setAltInput(alt || '')
					setTitleInput(title || '')
				} else {
					editor.commands.focus()
				}
			}}
			onCloseAutoFocus={e => e.preventDefault()}
			available={canRun}
			srcInput={srcInput}
			setSrcInput={setSrcInput}
			altInput={altInput}
			setAltInput={setAltInput}
			titleInput={titleInput}
			setTitleInput={setTitleInput}
			onAction={handleInsert}
		/>
	)
}
