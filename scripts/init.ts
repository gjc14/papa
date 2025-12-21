import { spawn } from 'child_process'

const scripts = [
	'tsx scripts/init-env.ts',
	'pnpm run db:push',
	'tsx scripts/init-object-storage.ts',
	'tsx scripts/init-user.ts',
	'pnpm run dev',
]

let currentProcess: ReturnType<typeof spawn> | null = null

// Handle Signal Interrupt (e.g. Ctrl+C)
process.on('SIGINT', () => {
	console.log('\n🛑 Received SIGINT, cleaning up...')
	if (currentProcess) {
		currentProcess.kill('SIGINT')
	}
	process.exit(0)
})

async function runScript(command: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const [cmd, ...args] = command.split(' ')

		currentProcess = spawn(cmd, args, {
			stdio: 'inherit',
			shell: true,
		})

		currentProcess.on('exit', code => {
			currentProcess = null
			if (code === 0) {
				resolve()
			} else {
				reject(new Error(`Command failed with exit code ${code}`))
			}
		})

		currentProcess.on('error', error => {
			currentProcess = null
			reject(error)
		})
	})
}

async function main() {
	for (const script of scripts) {
		console.log(`\n▶️  Running: ${script}`)
		try {
			await runScript(script)
		} catch (error) {
			console.error(`\n❌ Failed: ${script}`)
			process.exit(1)
		}
	}
}

main()
