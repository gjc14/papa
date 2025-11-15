import 'dotenv/config'

import { spawn } from 'child_process'

import { initLocale, t } from './i18n'

/**
 * Execute a command and return a promise
 */
function execCommand(command: string, args: string[] = []): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: 'inherit',
			shell: true,
		})

		child.on('close', code => {
			if (code !== 0) {
				reject(new Error(`Command failed with code ${code}`))
			} else {
				resolve()
			}
		})

		child.on('error', err => {
			reject(err)
		})
	})
}

/**
 * Execute a tsx script with locale parameter
 */
async function execTsxScript(
	scriptPath: string,
	locale: string,
): Promise<void> {
	return execCommand('tsx', [scriptPath, locale])
}

/**
 * Main initialization flow
 */
async function init() {
	// Step 1: Get locale from user
	const locale = await initLocale()

	// Step 2: Check environment variables
	await execTsxScript('scripts/init-env.ts', locale)

	// Step 3: Push database schema
	await execCommand('pnpm', ['run', 'db:push'])

	// Step 4: Initialize object storage
	await execTsxScript('scripts/init-object-storage.ts', locale)

	// Step 5: Initialize admin user
	await execTsxScript('scripts/init-admin.ts', locale)

	// Step 6: Final initialization
	await execTsxScript('scripts/init-fin.ts', locale)

	// Step 7: Start dev server
	await execCommand('pnpm', ['run', 'dev'])
}

init().catch(error => {
	console.error(t('error-during-initialization'), error)
	process.exit(1)
})
