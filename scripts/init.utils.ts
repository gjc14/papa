import { type EnvKey, getEnv } from "env"

export function checkEnv(envKey: EnvKey): boolean {
	if (!getEnv(envKey)) {
		console.warn(
			`\n⚠️ ${envKey} is not set. Please set this to enable the service. Path: \`./.env\``,
		)
		console.warn(
			`-> Please add \`${envKey}=...\` to \`./.env\` file. To initialize, run \`cp env.example .env\` in the root directory of the project to copy the example file.`,
		)
		return false
	}

	console.log(` - ${envKey} is set`)
	return true
}
