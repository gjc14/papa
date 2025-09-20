/**
 * PostEditor uses Jotai, should be placed in <Provider> context.
 */
import './styles.css'
import './styles/image-node.css'

import { useCallback, useEffect, useMemo } from 'react'

import { toast } from '@gjc14/sonner'
import { EditorContent, useEditor } from '@tiptap/react'
import { useAtom } from 'jotai'
import debounce from 'lodash/debounce'

import { ExtensionKit } from '~/components/editor/extensions/extension-kit'

import { editorAtom, editorContentAtom, serverPostAtom } from '../../context'

export function ContentEditor() {
	const [serverPost] = useAtom(serverPostAtom)
	const [, setEditor] = useAtom(editorAtom)
	const [, setEditorContent] = useAtom(editorContentAtom)

	// Drop configurations
	const allowedMimeTypes = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/avif',
		// apple
		'image/heic',
		'image/heif',
	]

	// Content realtime update for hasChanges check
	const debouncedSetEditorContent = useMemo(
		() =>
			debounce((content: string) => {
				setEditorContent(content)
			}, 300), // 300ms delay
		[setEditorContent],
	)

	useEffect(() => {
		return () => {
			debouncedSetEditorContent.cancel()
		}
	}, [debouncedSetEditorContent])

	const editor = useEditor({
		immediatelyRender: false,
		extensions: ExtensionKit(),
		content: serverPost?.content ? JSON.parse(serverPost.content) : undefined,
		editorProps: {
			attributes: {
				class: 'mt-6 prose-article focus:outline-hidden',
			},
			// https://github.com/ueberdosis/tiptap/blob/develop/packages/extension-file-handler/src/FileHandlePlugin.ts
			handleDrop(view, event, slice, moved) {
				if (moved) return false // don't handle if it's a move event (e.g. dragging selected text)
				if (!event.dataTransfer?.files.length) {
					return false
				}

				const dropPos = view.posAtCoords({
					left: event.clientX,
					top: event.clientY,
				})

				let filesArray = Array.from(event.dataTransfer.files)

				filesArray = filesArray.filter(file =>
					allowedMimeTypes.includes(file.type),
				)

				if (filesArray.length === 0) {
					return false
				}

				event.preventDefault()
				event.stopPropagation()

				filesArray.map(file => {
					switch (file.type.split('/')[0]) {
						case 'image':
							console.log('Image dropped:', file)
							return handleImageDrop(file, dropPos?.pos || 0)
						default:
							toast.error(`Unsupported file type: ${file.type}`)
							console.warn('Unsupported file type:', file.type, file)
							return
					}
				})

				return true
			},
		},
		onCreate(props) {
			setEditor(props.editor)
			props.editor.commands.focus(1)
		},
		onUpdate(props) {
			const jsonContent = props.editor.getJSON()
			debouncedSetEditorContent(JSON.stringify(jsonContent))
		},
		onDestroy() {
			// Clean up editor in jotai to prevent access before next mount, e.g. when navigating away and back
			setEditor(null)
		},
	})

	useEffect(() => {
		editor?.commands.setContent(
			serverPost?.content ? JSON.parse(serverPost.content) : undefined,
		)
		setEditorContent(serverPost?.content || '')
	}, [serverPost])

	/////////////////////////////
	///      Drop Upload      ///
	/////////////////////////////
	const imageBlobMap = new Map<string, File>()

	const handleImageDrop = useCallback(
		async (file: File, dropPos: number) => {
			if (!editor) return

			const previewURL = URL.createObjectURL(file)
			imageBlobMap.set(previewURL, file)

			editor
				.chain()
				.insertContentAt(dropPos, {
					type: 'image',
					attrs: {
						src: previewURL,
						alt: file.name,
						title: file.name,
					},
				})
				.focus()
				.run()
		},
		[imageBlobMap, editor],
	)

	// Handle shortcut keys
	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.stopPropagation() // prevent passing e out e.g. mod+b will only bold rather than toggle sidebar as well
		// e.preventDefault() // TBD. prevent like mod+s save, mod+p print, or mod+r refres
	}

	return <EditorContent editor={editor} onKeyDown={handleKeyDown} />
}
