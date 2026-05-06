import { spawn } from "node:child_process"

const scripts = [
	"pnpm run init:1", // env
	"pnpm run init:2", // database
	"pnpm run init:3", // object storage
	"pnpm run db:push", // schema
	"pnpm run init:4", // user
	"pnpm run dev",
]

let currentProcess: ReturnType<typeof spawn> | null = null

// Handle Signal Interrupt (e.g., Ctrl+C)
process.on("SIGINT", () => {
	console.log("\n🛑 Received SIGINT, cleaning up...")
	if (currentProcess) {
		currentProcess.kill("SIGINT")
	}
	process.exit(0)
})

async function runScript(command: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const [cmd, ...args] = command.split(" ")

		currentProcess = spawn(cmd, args, {
			stdio: "inherit",
		})

		currentProcess.on("exit", (code) => {
			currentProcess = null
			if (code === 0) {
				resolve()
			} else {
				reject(new Error(`Command failed with exit code ${code}`))
			}
		})

		currentProcess.on("error", (error) => {
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
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error(`\n❌ Error: ${error.message}`)
			} else {
				console.error(`\n❌ Failed: ${script}`)
			}

			process.exit(1)
		}
	}
}

main()
