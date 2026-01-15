import { Editor } from '@tiptap/core'
import { atom } from 'jotai'

import type { loader } from '~/routes/dashboard/assets/resource'

import type { PostWithRelations } from '../lib/db/post.server'
import type { Category, Tag } from '../lib/db/schema'
import { defaultContent } from './post-slug/utils'
import { areDifferentPosts } from './utils'

// used when post loaded / updated from server
export const serverPostAtom = atom<PostWithRelations | null>(null) // only for comparison
// used when post is being edited
export const postAtom = atom<PostWithRelations | null>(null) // actually used

export const tagsAtom = atom<Tag[]>([])
export const categoriesAtom = atom<(Category & { children: Category[] })[]>([])
export const editorAtom = atom<Editor | null>(null)
export const editorContentAtom = atom<string | null>(null)

type AssetLoaderData = Awaited<ReturnType<typeof loader>>

export const assetsAtom = atom<AssetLoaderData | null>(null)

export const isSettingsOpenAtom = atom(false)

export const isRestoreAlertOpenAtom = atom(false)
export const isResetAlertOpenAtom = atom(false)
export const isDeleteAlertOpenAtom = atom(false)

export const isSavingAtom = atom(false)
export const isDeletingAtom = atom(false)

export const isDraftCheckCompleteAtom = atom(false)

export const hasChangesAtom = atom(get => {
	const [server, draft] = [get(serverPostAtom), get(postAtom)]
	const editorContent = get(editorContentAtom)
	if (!editorContent || !server || !draft) return false

	if ((server.content || defaultContent) !== editorContent) return true
	return areDifferentPosts(server, draft)
})
