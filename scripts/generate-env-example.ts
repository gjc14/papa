import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { ENV_DEFINITIONS } from "../env"

const buildEnvExampleContent = () => {
	return `${Object.entries(ENV_DEFINITIONS)
		.map(([key, definition]) => {
			if ("exampleValue" in definition) {
				return `# ${definition.comment}\n${key}=${definition.exampleValue}`
			}

			return `# ${definition.comment}`
		})
		.join("\n\n")}\n`
}

const outputPath = resolve(process.cwd(), ".env.example")
writeFileSync(outputPath, buildEnvExampleContent(), "utf8")
console.log(`Generated ${outputPath}`)
