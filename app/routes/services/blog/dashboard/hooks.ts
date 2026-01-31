import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'

import { useAtom } from 'jotai'

import { assetsAtom } from '~/context/assets'
import type { loader } from '~/routes/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/dashboard/assets/utils'

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
		isLoading: fetcher.state !== 'idle',
	}
}
