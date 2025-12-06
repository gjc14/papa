import { useCallback, useEffect, useRef, useState } from 'react'

type Direction = 'up' | 'down'

/**
 * Pass in section ids to subscribe to container scroll. Handle scroll efect yourself.
 *
 * @example
 * const handleLinkClick = (e: React.MouseEvent, id: string) => {
 *		e.preventDefault()
 *		const el = document.getElementById(id)
 *		const container = containerRef.current
 *		if (el && container) {
 *			const top =
 *				el.getBoundingClientRect().top -
 *				container.getBoundingClientRect().top +
 *				container.scrollTop -
 *				80
 *			container.scrollTo({ top, behavior: 'smooth' })
 *		}
 *	}
 */
export function useInPageNavigation({
	containerRef,
	SECTIONS,
	DOWN_THRESHOLD_VH = 0.75, // 75% down the viewport
	UP_THRESHOLD_VH = 0.25, // 25% down the viewport
}: {
	containerRef: React.RefObject<HTMLDivElement | null>
	SECTIONS: { id: string }[]
	DOWN_THRESHOLD_VH?: number
	UP_THRESHOLD_VH?: number
}): {
	activeId: string
	scrollDir: Direction
	DOWN_THRESHOLD_VH: number
	UP_THRESHOLD_VH: number
} {
	const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
	const [scrollDir, setScrollDir] = useState<Direction>('down')

	// Use a ref to track the last scroll position for direction calculation
	const lastScrollY = useRef(0)

	const handleScroll = useCallback(() => {
		const container = containerRef.current
		if (!container) return

		const currentScrollY = container.scrollTop

		// 1. Determine Direction
		// If scroll position hasn't changed, do nothing
		if (Math.abs(currentScrollY - lastScrollY.current) === 0) return

		const currentDirection =
			currentScrollY > lastScrollY.current ? 'down' : 'up'

		// Update state and ref
		setScrollDir(currentDirection)
		lastScrollY.current = currentScrollY

		// 2. Select Threshold based on Direction
		const vh = container.clientHeight
		const threshold =
			currentDirection === 'down'
				? vh * DOWN_THRESHOLD_VH
				: vh * UP_THRESHOLD_VH

		const containerRect = container.getBoundingClientRect()
		const thresholdY = containerRect.top + threshold

		// 3. Find Active Section
		// We look for the *last* section whose top edge is above (less than) the threshold line.
		let newActiveId = SECTIONS[0].id

		for (const section of SECTIONS) {
			const el = document.getElementById(section.id)
			if (el) {
				const rect = el.getBoundingClientRect()
				// If the section's top is physically above the threshold line on screen...
				if (rect.top < thresholdY) {
					newActiveId = section.id
				} else {
					// Sections are ordered, so if this one is below threshold, subsequent ones are too.
					break
				}
			}
		}

		setActiveId(newActiveId)
	}, [])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const onScroll = () => requestAnimationFrame(handleScroll)
		container.addEventListener('scroll', onScroll, { passive: true })
		// Run once on mount to set initial state
		handleScroll()
		return () => container.removeEventListener('scroll', onScroll)
	}, [handleScroll])

	return {
		activeId,
		scrollDir,
		DOWN_THRESHOLD_VH,
		UP_THRESHOLD_VH,
	}
}
