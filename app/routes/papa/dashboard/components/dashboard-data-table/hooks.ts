import React from 'react'

/**
 * A hook that returns a tuple of `[shouldSkip, skip]` to control auto-resetting of pagination.
 * @returns [shouldSkip, skip]
 *
 * @example
 * const [shouldSkip, skip] = useSkipper()
 *
 * <DashboardDataTable
 *   autoResetPageIndex={shouldSkip}
 *   skipAutoResetPageIndex={skip}
 * />
 */
function useSkipper() {
	const shouldSkipRef = React.useRef(true)
	const shouldSkip = shouldSkipRef.current

	// Wrap a function with this to skip a pagination reset temporarily
	const skip = React.useCallback(() => {
		shouldSkipRef.current = false
	}, [])

	React.useEffect(() => {
		shouldSkipRef.current = true
	})

	return [shouldSkip, skip] as const
}

export { useSkipper }
