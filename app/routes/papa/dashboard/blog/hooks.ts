import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'

import { useAtom } from 'jotai'

import type { loader } from '~/routes/papa/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/papa/dashboard/assets/utils'

import { assetsAtom } from './context'

/**
 * Trigger fetcher to load files and save them to assetsAtom.
 *
 * 1. If no files context, trigger fetcher.load
 * 2. When fetcher.load return data and setFilesContext
 * @returns The assets context including files, origin, hasObjectStorage, and isLoading
 *
 * @example
 * ```tsx
 * export const Component = () => {
 *  const { files, origin, hasObjectStorage, isLoading } = useAssetsContext()
 *
 *  return (
 *      <>
 *       {isLoading ? (
 *       	<button><Loader className="animate-spin" /> Select from Gallery</button>
 *       ) : hasObjectStorage ? (
 *       	<FileGrid files={files} />
 *       ) : (
 *       	<p disabled>No Object Storage Configured</p>
 *       )})
 *      </>
 * }
 * ```
 */
export const useAssetsContext = () => {
	const fetcher = useFetcher<typeof loader>()

	const [filesContext, setFilesContext] = useAtom(assetsAtom)
	const files = filesContext?.files || []
	const origin = filesContext?.origin || ''
	const hasObjectStorage = filesContext?.hasObjectStorage || false

	useEffect(() => {
		if (filesContext) {
		} else {
			fetcher.load(assetResourceRoute)
		}
	}, [])

	useEffect(() => {
		if (fetcher.data) {
			setFilesContext(fetcher.data)
		}
	}, [fetcher])

	return {
		filesContext,
		files,
		origin,
		hasObjectStorage,
		isLoading: fetcher.state !== 'idle',
	}
}
