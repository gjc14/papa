import readline from 'readline'

import { generateSlug } from '~/lib/utils/seo'

/** Prompt input and return a sanitized slug */
const askInput = (q?: string, defaulValue?: string): Promise<string> => {
	return new Promise(resolve => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		const displayDefaultValue = defaulValue ? ` (default: ${defaulValue})` : ''
		const displayQ = q ? q : 'Input'
		rl.question(`${displayQ}${displayDefaultValue}: `, answer => {
			rl.close()
			const raw = (answer ?? defaulValue).trim()
			const lowered = raw.length ? raw.toLowerCase() : (defaulValue ?? '')
			const sanitized = generateSlug(lowered)
			resolve(sanitized)
		})
	})
}

export { askInput }
