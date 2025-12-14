import { useEffect } from 'react'

import { useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'

import {
	isDraftCheckCompleteAtom,
	isRestoreAlertOpenAtom,
	serverPostAtom,
} from '../context'
import { areDifferentPosts } from '../utils'
import { postLocalStorageKey } from './utils'

/**
 * This file handles local-storage draft checking.
 * 1. When `isDraftCheckCompleteAtom` changes to `false`, run the check.
 * 2. If there is a draft, show `PostRestoreAlert` to let user choose to restore or discard.
 * 3. If no draft, set `isDraftCheckCompleteAtom` to `true`.
 */
export const useCheckDraft = () => {
	const [isDraftCheckComplete, setIsDraftCheckComplete] = useAtom(
		isDraftCheckCompleteAtom,
	)
	const [, setIsRestoreAlertOpen] = useAtom(isRestoreAlertOpenAtom)
	const [serverPost] = useAtom(serverPostAtom)

	useHydrateAtoms([[isDraftCheckCompleteAtom, false]])

	useEffect(() => {
		if (!serverPost || isDraftCheckComplete) return

		const localStorageKey = postLocalStorageKey(serverPost.id)

		const dirtyPost = window.localStorage.getItem(localStorageKey)
		if (!dirtyPost) {
			return setIsDraftCheckComplete(true)
		}

		const parsed = JSON.parse(dirtyPost)
		if (areDifferentPosts(serverPost, parsed)) {
			setIsRestoreAlertOpen(true)
		} else {
			setIsDraftCheckComplete(true)
		}
	}, [isDraftCheckComplete, serverPost])
}
