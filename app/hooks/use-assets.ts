import { useEffect } from 'react'
import { useFetcher } from 'react-router'

import { useAtom } from 'jotai'

import { assetsAtom } from '~/context/assets'
import type { loader } from '~/routes/dashboard/assets/resource'
import { assetResourceRoute } from '~/routes/dashboard/assets/utils'

/**
 * Trigger fetcher to load files and save them to assetsAtom.
 * Flow:
 * 1. If no assets and fetchOnLoad is true, trigger fetcher.load
 * 2. When fetcher.load return data, setAssets
 * @returns The assets including files, origin, hasObjectStorage, and isLoading. Also returns load function to manually trigger loading.
 *
 * @example
 * ```tsx
 * export const Component = () => {
 *  const { assets, isLoading } = useAssets({ fetchOnLoad: true })
 *
 *  return (
 *      <>
 *       {isLoading ? (
 *       	<button>
 *              <Loader className="animate-spin" />{" "}
 *              Select from Gallery
 *       	</button>
 *       ) : !assets ? null : assets.hasObjectStorage ? (
 *       	<FileGrid files={assets.files} />
 *       ) : (
 *       	<p disabled>No Object Storage Configured</p>
 *       )}
 *      </>
 * }
 * ```
 */
export const useAssets = ({
	fetchOnLoad = false,
}: {
	fetchOnLoad?: boolean
} = {}) => {
	const [assets, setAssets] = useAtom(assetsAtom)

	const fetcher = useFetcher<typeof loader>()
	const load = () => fetcher.load(assetResourceRoute)

	useEffect(() => {
		if (assets) return
		if (fetchOnLoad) load()
	}, [fetchOnLoad])

	useEffect(() => {
		if (fetcher.data) setAssets(fetcher.data)
	}, [fetcher])

	return {
		load,
		assets,
		setAssets,
		isLoading: fetcher.state === 'loading',
	}
}
