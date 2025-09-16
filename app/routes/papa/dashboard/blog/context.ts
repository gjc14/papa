import { Editor } from '@tiptap/core'
import { atom } from 'jotai'

import type { PostWithRelations } from '~/lib/db/post.server'
import type { Category, Tag } from '~/lib/db/schema'

import { areDifferentPosts } from './utils'

export const serverPostAtom = atom<PostWithRelations | null>() // only for comparison
export const postAtom = atom<PostWithRelations | null>() // actually used
export const tagsAtom = atom<Tag[]>([])
export const categoriesAtom = atom<Category[]>([])
export const editorAtom = atom<Editor | null>(null)
export const editorContentAtom = atom<string | null>(null)

export const isSettingsOpenAtom = atom(false)

const defaultContent = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null}}]}`

export const hasChangesAtom = atom(get => {
	const [server, draft] = [get(serverPostAtom), get(postAtom)]
	const editorContent = get(editorContentAtom)
	if (!editorContent || !server || !draft) return false

	if ((server.content || defaultContent) !== editorContent) return true
	return areDifferentPosts(server, draft)
})

export const isRestoreAlertOpenAtom = atom(false)
export const isResetAlertOpenAtom = atom(false)
export const isDeleteAlertOpenAtom = atom(false)

export const isSavingAtom = atom(false)
export const isDeletingAtom = atom(false)
