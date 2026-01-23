import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import readline from 'readline'

import { generateSlug } from '~/lib/utils/seo'

const createTemplates = (routeName: string) => {
	const serviceConfig = `
import type { Service } from '~/lib/utils/service-configs'

export const config = {
    routes: ({ route }) => [route('/${routeName}', './routes/services/${routeName}/route.tsx')],
} satisfies Service

`.trim()

	const routeFile = `
import type { Route } from './+types/route'

export const action = async ({ request, params }: Route.ActionArgs) => {
    return {}
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    return {}
}

export default function Component({
    loaderData,
    actionData,
}: Route.ComponentProps) {
    return (
        <main className="flex h-svh w-full flex-1 items-center justify-center">
            {/* Frontend Code here. */}
            <h1>route: /${routeName}</h1>
        </main>
    )
}

`.trim()

	return { serviceConfig, routeFile }
}

// File paths for service
const filePathServiceConfig = (routeName: string) =>
	join(process.cwd(), `app/routes/services/${routeName}/config.tsx`)

const filePathIndex = (routeName: string) =>
	join(process.cwd(), `app/routes/services/${routeName}/route.tsx`)

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const askRouteName = (defaultName = 'new-route'): Promise<string> => {
	return new Promise(resolve => {
		rl.question(`Route name (default: ${defaultName}): `, answer => {
			rl.close()
			const raw = (answer ?? defaultName).trim()
			const lowered = raw.length ? raw.toLowerCase() : defaultName
			const sanitized = generateSlug(lowered)
			resolve(sanitized || defaultName)
		})
	})
}

try {
	const routeName = await askRouteName('new-route')

	const { serviceConfig, routeFile } = createTemplates(routeName)

	// Create directories
	await mkdir(join(process.cwd(), `app/routes/services/${routeName}`), {
		recursive: true,
	})

	// Write all service files
	await writeFile(filePathServiceConfig(routeName), serviceConfig)
	await writeFile(filePathIndex(routeName), routeFile)

	console.log(
		`🎉 Service named ${routeName} files created successfully!

		📁 Created 2 files:
		1️⃣ ${filePathServiceConfig(routeName).split('app/routes')[1]}
		2️⃣ ${filePathIndex(routeName).split('app/routes')[1]}

        🌐 Navigate to '/${routeName}' to see the new service in action
        `.replace(/^[ \t]+/gm, ''),
	)
} catch (err) {
	console.error('Error creating service files:', err)
}
