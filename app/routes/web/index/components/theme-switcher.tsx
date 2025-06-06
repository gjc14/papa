import { Moon, Sun } from 'lucide-react'

import { setCustomTheme, useTheme } from '~/hooks/theme-provider'

export function ThemeSwitcher() {
	const { setTheme, theme } = useTheme()

	return (
		<>
			<button
				className="border-primary/80 bg-brand/30 mt-6 size-11 border-2 p-0"
				onClick={() => {
					setTheme(theme === 'dark' ? 'light' : 'dark')
					setCustomTheme(theme === 'dark' ? 'light' : 'dark')
				}}
			>
				<Sun className="stroke-foreground hidden size-6 dark:inline" />
				<Moon className="stroke-foreground inline size-6 dark:hidden" />
				<span className="sr-only">Toggle theme</span>
			</button>
		</>
	)
}
