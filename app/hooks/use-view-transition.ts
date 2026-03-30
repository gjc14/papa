import { useCallback } from "react"

export const useViewTransition = () => {
	const startViewTransition = useCallback((callback: () => void) => {
		if (!document.startViewTransition) {
			callback()
			return
		}
		document.startViewTransition(callback)
	}, [])

	return { startViewTransition }
}
