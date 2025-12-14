/**
 * PostEditor uses Jotai, should be placed in <Provider> context.
 * editor will be saved in jotai, so when navigating away and back, the editor instance is still there.
 * editorContent will update if serverPost changes (e.g. switch to another post, or update post)
 */
import './styles.css'
import './styles/image-node.css'
import './styles/youtube-node.css'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { toast } from '@gjc14/sonner'
import { EditorContent, useEditor } from '@tiptap/react'
import { useAtom } from 'jotai'
import debounce from 'lodash/debounce'

import { ExtensionKit } from '~/components/editor/extension-kit'
import { authClient } from '~/lib/auth/auth-client'
import {
	useFileUpload,
	type FileWithFileMetadata,
} from '~/routes/papa/dashboard/assets/utils'

import { editorAtom, editorContentAtom, serverPostAtom } from '../../context'
import { defaultContent } from '../../post-slug/utils'

export function ContentEditor() {
	const [postId, setPostId] = useState<number | null>(null)
	const { data: userSession } = authClient.useSession()
	const [serverPost] = useAtom(serverPostAtom)
	const [, setEditor] = useAtom(editorAtom)
	const [, setEditorContent] = useAtom(editorContentAtom)

	const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

				event.preventDefault()
				event.stopPropagation()

				filesArray.map(file => {
					if (file.size > MAX_FILE_SIZE) {
						toast.error(`File too large: ${file.name} (max 10MB)`)
						return
					}
					if (allowedMimeTypes.includes(file.type)) {
						switch (file.type.split('/')[0]) {
							case 'image':
								console.log('Image dropped:', file)
								return handleImageDrop(file, dropPos?.pos || 0)
							default:
								toast.error(`File type not implemented: ${file.type}`)
								console.warn('File type not implemented:', file.type, file)
								return
						}
					} else {
						toast.error(`Unsupported file type: ${file.type}`)
						console.warn('Unsupported file type:', file.type, file)
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
		if (!editor || !serverPost || !serverPost.id) return

		// Update content if navigated to another post, should not change if same post (e.g. revalidate after update)
		if (postId !== serverPost.id) {
			setPostId(serverPost.id)

			// Update content
			editor.commands.setContent(
				JSON.parse(serverPost.content || defaultContent),
			)
			setEditorContent(serverPost.content || defaultContent)
		}
	}, [editor, serverPost])

	// Handle shortcut keys
	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.stopPropagation() // prevent passing e out e.g. mod+b will only bold rather than toggle sidebar as well
		// e.preventDefault() // TBD. prevent like mod+s save, mod+p print, or mod+r refres
	}

	/////////////////////////////
	///      Drop Upload      ///
	/////////////////////////////
	const tmpImage = useMemo(
		() => new Map<string, FileWithFileMetadata & { previewURL: string }>(),
		[editor, serverPost],
	) // key: imageKey, value: FileWithFileMetadata. Only for preview and revokeObjectURL later
	const { uploadProgress, oneStepUpload } = useFileUpload()

	const handleImageDrop = useCallback(
		async (file: File, dropPos: number) => {
			if (!editor || !userSession) return

			const previewURL = URL.createObjectURL(file)

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

			await oneStepUpload([file], userSession.user.id, files =>
				tmpImage.set(files[0].key, { ...files[0], previewURL }),
			)
		},
		[tmpImage, userSession, oneStepUpload],
	)

	useEffect(() => {
		if (!editor) return

		// uploadProgress: { [key: string]: UploadProgress }
		Object.entries(uploadProgress).forEach(([key, progress]) => {
			const file = tmpImage.get(key)
			if (!file) return

			if (progress.status === 'error' || progress.status === 'completed') {
				// Find the image node with previewURL
				const imagePreviewNode = editor.$node('image', { src: file.previewURL })
				if (!imagePreviewNode) return

				switch (progress.status) {
					case 'error':
						toast.error(`Upload failed: ${progress.error}`)

						// Remove the image node with previewUrl
						editor
							.chain()
							.command(({ tr }) => {
								tr.deleteRange(imagePreviewNode.from, imagePreviewNode.to)
								return true
							})
							.run()
						break
					case 'completed':
						const url = `/assets/${file.id}`

						// Prefetch the image before replacing
						const img = new Image()
						img.onload = () => {
							// Replace the preview URL with the actual URL after image is loaded
							editor
								.chain()
								.command(({ tr }) => {
									tr.setNodeAttribute(imagePreviewNode.pos, 'src', url)
									return true
								})
								.run()
						}
						img.onerror = () => {
							console.error('Failed to load uploaded image:', url)
						}
						img.src = url
						break
				}

				tmpImage.delete(key)
				URL.revokeObjectURL(file.previewURL) // free memory
			}
		})
	}, [tmpImage, uploadProgress])

	return <EditorContent editor={editor} onKeyDown={handleKeyDown} />
}
