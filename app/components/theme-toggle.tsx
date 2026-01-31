import { forwardRef } from 'react'

import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useIsMounted } from '~/hooks/use-is-mounted'
import { useViewTransition } from '~/hooks/use-view-transition'
import { cn } from '~/lib/utils'

import { Button } from './ui/button'

type ThemeToggleProps = {
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

export const CurrentThemeIcon = ({
	size = 'sm',
	className,
}: {
	size?: 'sm' | 'md' | 'lg'
	className?: string
}) => {
	const { theme } = useTheme()
	const isMounted = useIsMounted()

	const iconSizes = {
		sm: 'size-4',
		md: 'size-5',
		lg: 'size-6',
	}

	return (
		<span
			className={cn(
				'relative flex items-center justify-center transition-opacity duration-300',
				isMounted ? 'opacity-100' : 'opacity-0',
				className,
			)}
		>
			{isMounted && (
				<>
					<Sun
						className={`absolute ${iconSizes[size]} ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'} transition-transform`}
					/>

					<Moon
						className={`absolute ${iconSizes[size]} ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'} transition-transform`}
					/>

					<SunMoon
						className={`absolute ${iconSizes[size]} ${theme === 'system' || theme === undefined ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'} transition-transform`}
					/>

					<span className="sr-only">Toggle theme</span>
				</>
			)}
		</span>
	)
}

export const ThemeToggle = forwardRef<
	HTMLButtonElement,
	ThemeToggleProps & ViewTransitionThemeOptions
>(({ size = 'sm', className, start, variant, duration }, ref) => {
	const { setTheme } = useTheme()
	const { startViewTransition } = useViewTransition()
	const { styles } = getViewTransitionStyles({
		start,
		variant,
		duration,
	})

	const buttonSizes = {
		sm: 'size-7',
		md: 'size-9',
		lg: 'size-11',
	}

	return (
		<DropdownMenu>
			<style>{styles}</style>
			<DropdownMenuTrigger asChild>
				<Button
					ref={ref}
					variant="outline"
					size="icon"
					className={cn(buttonSizes[size], className)}
				>
					<CurrentThemeIcon size={size} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => {
						startViewTransition(() => setTheme('light'))
					}}
				>
					Light
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => {
						startViewTransition(() => setTheme('dark'))
					}}
				>
					Dark
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => {
						startViewTransition(() => setTheme('system'))
					}}
				>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
})

// DropdownMenu
export const ThemeDropDownMenuTrigger = ({
	children,
	asChild = false,
}: {
	children: React.ReactNode
	asChild?: boolean
}) => {
	const { setTheme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={asChild}>{children}</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Sun size={16} className="mr-2" />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Moon size={16} className="mr-2" />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<SunMoon size={16} className="mr-2" />
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

// DropdownMenuSub
export const ThemeDropdownMenuSubTrigger = ({
	children,
	className,
	contentProps,
}: {
	children: React.ReactNode
	className?: string
	/** DropdownMenuSubContent props */
	contentProps?: React.ComponentPropsWithoutRef<typeof DropdownMenuSubContent>
}) => {
	const { setTheme } = useTheme()

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger className={className}>
				{children}
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent {...contentProps}>
					<DropdownMenuItem onClick={() => setTheme('light')}>
						<Sun size={16} className="mr-2" />
						Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('dark')}>
						<Moon size={16} className="mr-2" />
						Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme('system')}>
						<SunMoon size={16} className="mr-2" />
						System
					</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	)
}

// === Transition Styles ===

type Start = 'top left' | 'bottom left' | 'top right' | 'bottom right'
type Variant = 'circle' | 'circle-blur'

const maskMap: Record<
	Start,
	{ cx: string; cy: string; origin: string; pos: string }
> = {
	'top left': { cx: '0', cy: '0', origin: 'top left', pos: 'top left' },
	'top right': { cx: '40', cy: '0', origin: 'top right', pos: 'top right' },
	'bottom left': {
		cx: '0',
		cy: '40',
		origin: 'bottom left',
		pos: 'bottom left',
	},
	'bottom right': {
		cx: '40',
		cy: '40',
		origin: 'bottom right',
		pos: 'bottom right',
	},
}

const maskSvg = (variant: Variant, cx: string, cy: string) => {
	switch (variant) {
		case 'circle':
			return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="18" fill="white"/></svg>')`
		case 'circle-blur':
			return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>')`
		default:
			return ''
	}
}

const keyframes = (variant: Variant) => {
	switch (variant) {
		case 'circle':
		case 'circle-blur':
			return `
			@keyframes scale {
			to {
				mask-size: 350vmax;
			}
		`
		default:
			return ''
	}
}

export interface ViewTransitionThemeOptions {
	start?: Start
	variant?: Variant
	duration?: number
}

export const getViewTransitionStyles = (
	options: ViewTransitionThemeOptions = {},
) => {
	const { start = 'top left', variant = 'circle', duration = 0.8 } = options

	const { cx, cy, origin, pos } = maskMap[start]
	const mask = maskSvg(variant, cx, cy)
	const kf = keyframes(variant)

	const styles = `
		::view-transition-group(root) {
			animation-timing-function: var(--expo-out);
		}

		::view-transition-new(root) {
			mask: ${mask} ${pos} / 0 no-repeat;
			mask-origin: content-box;
			animation: scale ${duration}s;
			transform-origin: ${origin};
		}

		::view-transition-old(root),
			[data-theme="dark"]::view-transition-old(root) {
			animation: scale ${duration}s;
			transform-origin: ${origin};
			z-index: -1;
		}

		${kf}
	`

	return { styles }
}
