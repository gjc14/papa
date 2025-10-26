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
 * ```markdown
 * Data flow:
 * submitting   --->   loading   --->   idle
 * ^action()           ^loader()        ^done
 * ^no data            ^data            ^data
 * ```
 *
 * fetcher.submit and fetcher.load both triggers action() or loader() when state 'submitting',
 * so the data are available once state is 'loading'.
 */
export function useFetcherNotification<
	T extends ActionResponse,
> /** Fetcher to subscribe, should fetch an action returning {@link ActionResponse} */(
	fetcher: FetcherWithComponents<T>,
	props: {
		/** Alert when `action` return please use 'loading'. If you wish to alert after `loader` revalidate, please use 'idle' @default 'loading' */
		alertWhen?: 'loading' | 'idle'
		/** Callback on success */
		onSuccess?: (msg?: string) => void
		/** Callback on error */
		onError?: (err?: string) => void
		/** Customize success message instead of returned from server */
		successMessage?: string
		/** Customize error message instead of returned from server */
		errorMessage?: string
		/** Prevent success alert from showing */
		preventSuccessAlert?: boolean
		/** Prevent error alert from showing */
		preventErrorAlert?: boolean
	} & ExternalToast = { alertWhen: 'loading' },
) {
	const {
		onSuccess,
		onError,
		alertWhen,
		successMessage,
		errorMessage,
		preventSuccessAlert,
		preventErrorAlert,
		...toastOptions
	} = props

	useEffect(() => {
		if (fetcher.state === alertWhen && fetcher.data) {
			const prevented = fetcher.data.preventNotification
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
		mutating:
			props.alertWhen === 'idle'
				? fetcher.state !== 'idle'
				: fetcher.state === 'submitting',
		isSubmitting: fetcher.state === 'submitting',
		isLoading: fetcher.state === 'loading',
		isIdle: fetcher.state === 'idle',
	}
}
