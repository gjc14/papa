import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'

import { motion } from 'motion/react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export interface RouteButton {
	to: string
	title: string
}

export const AnimatedNav = ({
	routes,
}: {
	routes: (RouteButton & React.ComponentProps<'button'>)[]
}) => {
	const [hoveredTab, setHoveredTab] = useState<number | null>(null)
	const [activeTabBounds, setActiveTabBounds] = useState<{
		left: number
		width: number
	}>({ left: 0, width: 0 })
	const [hoverTabBounds, setHoverTabBounds] = useState<{
		left: number
		width: number
	}>({ left: 0, width: 0 })
	const navRef = useRef<HTMLDivElement>(null)

	console.log('routes', routes)

	useEffect(() => {
		if (hoveredTab !== null && navRef.current) {
			const buttonElement = navRef.current.querySelector(
				`[data-index="${hoveredTab}"]`,
			) as HTMLElement
			if (buttonElement) {
				const navBounds = navRef.current.getBoundingClientRect()
				const buttonBounds = buttonElement.getBoundingClientRect()

				setHoverTabBounds({
					left: buttonBounds.left - navBounds.left,
					width: buttonBounds.width,
				})
			}
		}
	}, [hoveredTab])

	// Update active tab position
	const updateActiveTabPosition = (index: number) => {
		if (navRef.current) {
			const buttonElement = navRef.current.querySelector(
				`[data-index="${index}"]`,
			) as HTMLElement
			if (buttonElement) {
				const navBounds = navRef.current.getBoundingClientRect()
				const buttonBounds = buttonElement.getBoundingClientRect()

				setActiveTabBounds({
					left: buttonBounds.left - navBounds.left,
					width: buttonBounds.width,
				})
			}
		}
	}

	return (
		<nav ref={navRef} className="relative flex w-full gap-[-0.125rem] border-b">
			{/* Hover background */}
			<motion.div
				className="bg-muted/80 absolute h-8"
				initial={false}
				animate={{
					x: hoverTabBounds.left,
					width: hoverTabBounds.width,
				}}
				transition={{
					type: 'spring',
					stiffness: 500,
					damping: 30,
				}}
				style={{
					display: hoveredTab === null ? 'none' : 'block',
				}}
			/>

			{/* Active tab underline */}
			<motion.div
				className="bg-primary absolute bottom-0 h-0.5"
				initial={false}
				animate={{
					x: activeTabBounds.left,
					width: activeTabBounds.width,
				}}
				transition={{
					type: 'spring',
					stiffness: 500,
					damping: 50,
				}}
			/>

			{routes.map((route, i) => {
				const { to, title, ...buttonProps } = route
				return (
					<AnimatedLink
						key={i}
						to={to}
						title={title}
						index={i}
						onHover={() => setHoveredTab(i)}
						onLeave={() => setHoveredTab(null)}
						onActive={() => updateActiveTabPosition(i)}
						{...buttonProps}
					/>
				)
			})}
		</nav>
	)
}

interface AnimatedLinkProps extends RouteButton {
	onHover: () => void
	onLeave: () => void
	onActive: () => void
	index: number
}

const AnimatedLink = ({
	to,
	title,
	index,
	onHover,
	onLeave,
	onActive,
	className,
	...rest
}: AnimatedLinkProps & React.ComponentProps<'button'>) => {
	return (
		<NavLink to={to} end className="relative">
			{({ isActive, isPending }) => {
				// Call onActive when isActive changes
				useEffect(() => {
					if (isActive) {
						onActive()
					}
				}, [isActive])

				return (
					<motion.div
						animate={{
							scale: isActive ? 1.05 : 1,
						}}
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
					>
						<Button
							variant={'ghost'}
							data-index={index}
							className={cn(
								'mb-2 h-8 px-3',
								'hover:bg-transparent dark:hover:bg-transparent',
								isActive ? 'text-foreground' : 'text-muted-foreground',
								isPending ? 'animate-pulse' : '',
								className,
							)}
							onMouseEnter={onHover}
							onMouseLeave={onLeave}
							{...rest}
						>
							{title}
						</Button>
					</motion.div>
				)
			}}
		</NavLink>
	)
}
