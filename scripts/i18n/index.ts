import * as readline from 'node:readline'

import { en, zhTW } from './locales'
import type { Translations } from './locales/en'

const translations = {
	en,
	'zh-TW': zhTW,
}

type Locale = keyof typeof translations

const DEFAULT_LOCALE: Locale = 'en'

const AVAILABLE_LOCALES = Object.keys(
	translations,
) as (keyof typeof translations)[]

let selectedLocale: Locale | null = null

async function promptLocaleSelection(): Promise<Locale> {
	return new Promise(resolve => {
		let currentIndex = 0
		const locales = AVAILABLE_LOCALES

		console.log(
			'Select language: (Use ↑/↓ arrow keys to navigate, Enter to select)\n',
		)
		console.log()

		const displayMenu = () => {
			// Clear previous lines
			readline.cursorTo(process.stdout, 0)
			readline.moveCursor(process.stdout, 0, -locales.length)

			locales.forEach((locale, index) => {
				const isSelected = index === currentIndex ? '*' : ' '
				const name = translations[locale]['language-name']

				console.log(`${isSelected} ${name}`)
			})
		}

		displayMenu()

		const onKeypress = (_str: string, key: readline.Key) => {
			if (key.name === 'up') {
				currentIndex = currentIndex > 0 ? currentIndex - 1 : locales.length - 1
				displayMenu()
			} else if (key.name === 'down') {
				currentIndex = currentIndex < locales.length - 1 ? currentIndex + 1 : 0
				displayMenu()
			} else if (key.name === 'return') {
				process.stdin.removeListener('keypress', onKeypress)
				if (process.stdin.isTTY) {
					process.stdin.setRawMode(false)
				}
				process.stdin.pause()
				console.log() // Add newline after selection
				resolve(locales[currentIndex])
			} else if (key.ctrl && key.name === 'c') {
				process.stdin.removeListener('keypress', onKeypress)
				if (process.stdin.isTTY) {
					process.stdin.setRawMode(false)
				}
				process.stdin.pause()
				process.exit(1)
			}
		}

		readline.emitKeypressEvents(process.stdin)
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true)
		}
		process.stdin.resume()
		process.stdin.on('keypress', onKeypress)
	})
}

async function selectLocale(): Promise<Locale> {
	// 1. Check if already selected in this session
	if (selectedLocale) {
		return selectedLocale
	}

	// 2. Prompt user to select
	selectedLocale = await promptLocaleSelection()
	return selectedLocale
}

// Set locale programmatically (useful for passing from parent script)
function setLocale(locale: string): void {
	if (AVAILABLE_LOCALES.includes(locale as Locale)) {
		selectedLocale = locale as Locale
	} else {
		console.warn(`Invalid locale: ${locale}, using default: ${DEFAULT_LOCALE}`)
		selectedLocale = DEFAULT_LOCALE
	}
}

// Get current locale (synchronous, must call initLocale first)
function getLocale(): Locale {
	if (!selectedLocale) {
		throw new Error(
			'Locale not initialized. Please call initLocale() at the start of your script.',
		)
	}
	return selectedLocale
}

// Translation function with object parameters
export function t(
	key: keyof Translations,
	vars?: Record<string, string | number>,
): string {
	const locale = getLocale()

	// Get translation text, fallback to English
	let text = translations[locale][key]
	if (!text) {
		text = translations[DEFAULT_LOCALE][key]
	}
	if (!text) {
		console.warn(`Translation not found for key: ${key}`)
		return key
	}

	// Replace variables using template syntax {{variable}}
	if (vars) {
		Object.entries(vars).forEach(([varName, value]) => {
			text = text.replace(new RegExp(`{{${varName}}}`, 'g'), String(value))
		})
	}

	return text
}

// Helper to initialize locale selection at the start of scripts
// MUST be called before using t()
export async function initLocale(locale?: string): Promise<Locale> {
	if (locale) {
		setLocale(locale)
		return getLocale()
	}
	return await selectLocale()
}

// Export setLocale for programmatic locale setting
export { setLocale }
