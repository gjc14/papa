import { useEffect, useRef } from 'react'
import { useFetchers, type FetcherWithComponents } from 'react-router'

import { toast, type ExternalToast } from '@gjc14/sonner'

import type { ActionResponse } from '~/lib/utils'

/** Function to check if fetchers have response that satisfies auto notification */
export function useServerNotification() {
	const fetchers = useFetchers()
	// Prevent duplicate notifications from same fetcher when re-render. e.g. navigate()
	const processedFetchersRef = useRef<Set<string>>(new Set())

	useEffect(() => {
		fetchers.forEach(fetcher => {
			const fetcherKey = fetcher.key
			if (processedFetchersRef.current.has(fetcherKey)) {
				if (fetcher.state === 'submitting') {
					processedFetchersRef.current.delete(fetcherKey)
				}
				return console.log('already processed', fetcherKey)
			}

			if (fetcher.data) {
				if (fetcher.data.preventNotification) return
				if (fetcher.data.msg) {
					toast.success(fetcher.data.msg)
				} else if (fetcher.data.err) {
					toast.error(fetcher.data.err)
				}

				processedFetchersRef.current.add(fetcherKey)
			}
		})
	}, [fetchers])
}

/**
 * Hook extends fetcher to show notification based on conventional action response {@link ActionResponse}
 *
 * **IMPORTANT**: When lighting fast requests happen, the state may skip 'loading' or 'submitting' state.
 *
 * ```markdown
 * Data flow:
 * submitting   --->   loading   --->   idle
 * ^action()           ^loader()        ^done
 * ^no data            ^data            ^data
 * ```
 *
 * fetcher.data is available once state is 'loading' when calling with fetcher.submit,
 * and is available once state is 'idle' when calling with fetcher.load.
 */
export function useFetcherNotification<
	T extends ActionResponse,
> /** Fetcher to subscribe, should fetch an action returning {@link ActionResponse} */(
	fetcher: FetcherWithComponents<T>,
	props: {
		/** Callback on success */
		onSuccess?: (msg?: string) => void
		/** Callback on error */
		onError?: (err?: string) => void
		/** Customize success message instead of returned from server */
		successMessage?: string
		/** Customize error message instead of returned from server */
		errorMessage?: string
		/** Prevent success alert from showing @default false */
		preventSuccessAlert?: boolean
		/** Prevent error alert from showing @default false */
		preventErrorAlert?: boolean
	} & ExternalToast = {},
) {
	const {
		onSuccess,
		onError,
		successMessage,
		errorMessage,
		preventSuccessAlert = false,
		preventErrorAlert = false,
		...toastOptions
	} = props

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			const prevented = !!fetcher.data.preventNotification
			if (fetcher.data.msg) {
				if (!prevented || !preventSuccessAlert) {
					toast.success(successMessage || fetcher.data.msg, toastOptions)
				}

				onSuccess?.(fetcher.data.msg)
			} else if (fetcher.data.err) {
				if (!prevented && !preventErrorAlert) {
					toast.error(errorMessage || fetcher.data.err, toastOptions)
				}

				onError?.(fetcher.data.err)
			}
		}
	}, [fetcher.state, fetcher.data])

	return {
		mutating: fetcher.state !== 'idle',
		isSubmitting: fetcher.state === 'submitting',
		isLoading: fetcher.state === 'loading',
		isIdle: fetcher.state === 'idle',
	}
}
