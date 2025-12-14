import { useEffect } from 'react'

import { useAtom } from 'jotai'

import type { PostWithRelations } from '~/lib/db/post.server'

import {
	editorContentAtom,
	hasChangesAtom,
	isDraftCheckCompleteAtom,
	isRestoreAlertOpenAtom,
	postAtom,
} from '../context'
import { postLocalStorageKey } from './utils'

/**
 * Auto save draft to local storage when there are changes
 */
export function useAutoSaveDraft() {
	const [post] = useAtom(postAtom)
	const [editorContent] = useAtom(editorContentAtom)
	const [hasChanges] = useAtom(hasChangesAtom)
	const [isRestoreAlertOpen] = useAtom(isRestoreAlertOpenAtom)
	const [isDraftCheckComplete] = useAtom(isDraftCheckCompleteAtom)

	useEffect(() => {
		if (!window) return

		if (!post || !editorContent) return

		if (isRestoreAlertOpen || !isDraftCheckComplete) return

		if (hasChanges) {
			const postToSave: PostWithRelations = {
				...post,
				content: editorContent,
			}
			localStorage.setItem(
				postLocalStorageKey(post.id),
				JSON.stringify(postToSave),
			)
		} else {
			localStorage.removeItem(postLocalStorageKey(post.id))
		}
	}, [
		post,
		editorContent,
		hasChanges,
		isRestoreAlertOpen,
		isDraftCheckComplete,
	])
}
