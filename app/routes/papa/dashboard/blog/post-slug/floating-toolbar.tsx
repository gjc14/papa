import { useEffect } from 'react'
import { useFetcher, useNavigate } from 'react-router'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { ExternalLink, Loader2, RotateCcw, Settings } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useIsMobile } from '~/hooks/use-mobile'
import { useFetcherNotification } from '~/hooks/use-notification'
import { generateSlug } from '~/lib/utils/seo'

import {
	editorAtom,
	hasChangesAtom,
	isDeletingAtom,
	isResetAlertOpenAtom,
	isSavingAtom,
	isSettingsOpenAtom,
	postAtom,
	serverPostAtom,
} from '../context'
import type { action } from '../resource'
import { postLocalStorageKey } from './utils'

export const FloatingToolbar = ({ isCreate }: { isCreate: boolean }) => {
	const isMobile = useIsMobile()
	const navigate = useNavigate()
	const fetcher = useFetcher<typeof action>()
	useFetcherNotification(fetcher)

	const isSubmitting = fetcher.state === 'submitting'
	const method = fetcher.formMethod
	const isSaving = isSubmitting && (method === 'PUT' || method === 'POST')

	const [post, setPost] = useAtom(postAtom)
	const setServerPost = useSetAtom(serverPostAtom)
	const editor = useAtomValue(editorAtom)
	const hasChanges = useAtomValue(hasChangesAtom)

	const setIsSaving = useSetAtom(isSavingAtom)
	const setIsSettingsOpen = useSetAtom(isSettingsOpenAtom)
	const setIsResetAlertOpen = useSetAtom(isResetAlertOpenAtom)
	const isDeleting = useAtomValue(isDeletingAtom)

	useHydrateAtoms([[isSavingAtom, isSaving]])

	// When saving state changes, update atoms
	useEffect(() => setIsSaving(isSaving), [isSaving])

	useEffect(() => {
		if (!post) return
		if (
			fetcher.state === 'loading' &&
			fetcher.data &&
			(fetcher.formMethod === 'PUT' || fetcher.formMethod === 'POST') &&
			'data' in fetcher.data
		) {
			const data = fetcher.data.data
			if (data) {
				// Update atoms with returned data
				window.localStorage.removeItem(postLocalStorageKey(post.id))
				setServerPost(data)
				setPost(data)
				data.slug !== post.slug && navigate('/dashboard/blog/' + data.slug)
			}
		}
	}, [fetcher.state, fetcher.formMethod, fetcher.data, isSubmitting])

	if (!post || !editor) return null

	const handleSave = () => {
		if (!hasChanges || isSaving || isDeleting || isSubmitting) return

		const now = Date.now()

		// Remove date fields and set default values
		const postReady = {
			...post,
			title: post.title || `p-${now}`,
			slug:
				post.slug ||
				generateSlug(post.title || `p-${now}`, {
					fallbackPrefix: 'post',
					prevent: ['new'],
				}),
			content: JSON.stringify(editor.getJSON()),
			createdAt: undefined,
			updatedAt: undefined,
			seo: {
				...post.seo,
				createdAt: undefined,
				updatedAt: undefined,
			},
		}

		fetcher.submit(JSON.stringify(postReady), {
			method: isCreate ? 'POST' : 'PUT',
			encType: 'application/json',
			action: '/dashboard/blog/resource',
		})
	}

	return (
		<div
			className={`absolute ${isMobile ? 'bottom-12' : 'bottom-8'} bg-primary left-1/2 z-10 mx-auto flex w-fit -translate-x-1/2 items-center gap-1 rounded-full border py-1 pr-1 pl-1.5 shadow-md ring-1 ring-black/5 backdrop-blur-sm supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-black/50`}
		>
			{/* Preview */}
			{!isCreate && (
				<Button
					variant={'link'}
					size={'sm'}
					className="text-xs"
					disabled={hasChanges}
					onClick={() =>
						navigate(
							`/blog/${post.slug}${post.status !== 'PUBLISHED' ? '?preview=true' : ''}`,
						)
					}
				>
					{post.status !== 'PUBLISHED' ? 'Preview post' : 'View post'}
					<ExternalLink className="size-3!" />
				</Button>
			)}

			{/* Discard */}
			<Button
				size={'sm'}
				variant={'destructive'}
				className="hover:text-destructive rounded-full border border-transparent hover:border-current hover:bg-transparent"
				disabled={!hasChanges || isSaving}
				onClick={() => setIsResetAlertOpen(true)}
			>
				<RotateCcw className="size-4" />
				<p className="text-xs">Reset</p>
			</Button>

			{/* Save */}
			<Button
				type="submit"
				size={'sm'}
				variant={'default'}
				className="hover:text-primary rounded-full border border-transparent hover:border-current hover:bg-transparent"
				disabled={!hasChanges || isSaving}
				onClick={handleSave}
			>
				{isSaving && <Loader2 size={16} className="animate-spin" />}
				<p className="text-xs">{isCreate ? 'Create' : 'Save'}</p>
			</Button>

			{/* Open settings */}
			<Button
				className="ml-1 size-8 rounded-full"
				size={'icon'}
				onClick={() => setIsSettingsOpen(p => !p)}
			>
				<Settings />
			</Button>
		</div>
	)
}
