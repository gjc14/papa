import { capitalize as cap } from '~/lib/utils'

export const MAC_SYMBOLS: Record<string, string> = {
	mod: '⌘',
	ctrl: '⌘',
	alt: '⌥',
	shift: '⇧',
	backspace: '⌫',
}

/**
 * Determines if the current platform is macOS
 * @returns boolean indicating if the current platform is Mac
 */
export function isMac(): boolean {
	return (
		typeof navigator !== 'undefined' &&
		navigator.platform.toLowerCase().includes('mac')
	)
}

/**
 * Formats a shortcut key based on the platform (Mac or non-Mac)
 * @param key - The key to format (e.g., "ctrl", "alt", "shift")
 * @param isMac - Boolean indicating if the platform is Mac
 * @param capitalize - Whether to capitalize the key (default: true)
 * @returns Formatted shortcut key symbol
 */
export const formatShortcutKey = (
	key: string,
	isMac: boolean,
	capitalize: boolean = true,
) => {
	const lowerKey = key.toLowerCase()

	if (isMac) {
		return MAC_SYMBOLS[lowerKey] || (capitalize ? cap(key) : key)
	}

	// Handle 'mod' key for non-Mac platforms (mod = ctrl on Windows/Linux)
	if (lowerKey === 'mod') {
		return capitalize ? 'Ctrl' : 'ctrl'
	}

	return capitalize ? cap(key) : key
}

/**
 * Parses a shortcut key string into an array of formatted key symbols
 * @param shortcutKeys - The string of shortcut keys (e.g., "ctrl-alt-shift")
 * @param delimiter - The delimiter used to split the keys (default: "-")
 * @param capitalize - Whether to capitalize the keys (default: true)
 * @returns Array of formatted shortcut key symbols
 */
export const parseShortcutKeys = (props: {
	shortcutKeys: string | undefined
	delimiter?: string
	capitalize?: boolean
}) => {
	const { shortcutKeys, delimiter = '+', capitalize = true } = props

	if (!shortcutKeys) return []

	return shortcutKeys
		.split(delimiter)
		.map(key => key.trim())
		.map(key => formatShortcutKey(key, isMac(), capitalize))
}
