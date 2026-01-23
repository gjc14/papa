import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

import { askInput } from './utils'

const createPaths = (routeName: string) => {
	return {
		serviceRoutesPath: join(
			process.cwd(),
			`app/routes/services/${routeName}/service.routes.ts`,
		),
		routeFilePath: join(
			process.cwd(),
			`app/routes/services/${routeName}/route.tsx`,
		),
	}
}

const createTemplates = (routeName: string) => {
	const serviceRoutes = `
// Please do not use alias "~", use relative path instead
// Because route registration runs at the same level as \`vite.config.ts\`, and not as part of the bundled code.
import { registerServiceRoutes } from '../../../lib/service/routes-registry'

registerServiceRoutes({
	routes: ({ route }) => [
		route('/${routeName}', './routes/services/${routeName}/route.tsx'),
	],
})

`

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

`

	return { serviceRoutes, routeFile }
}

try {
	const newRoute = await askInput('Create new route', 'new-route')

	// Create directories
	await mkdir(join(process.cwd(), `app/routes/services/${newRoute}`), {
		recursive: true,
	})

	const { serviceRoutesPath, routeFilePath } = createPaths(newRoute)
	const { serviceRoutes, routeFile } = createTemplates(newRoute)

	// Write all service files
	await writeFile(serviceRoutesPath, serviceRoutes.trim())
	await writeFile(routeFilePath, routeFile.trim())

	console.log(
		`🎉 Route [${newRoute}] created successfully!

		+ 2 files created:
		1️⃣ ${serviceRoutesPath.split('app/routes')[1]}
		2️⃣ ${routeFilePath.split('app/routes')[1]}

        -> Navigate to '/${newRoute}' to see the new route
        `.replace(/^[ \t]+/gm, ''),
	)
} catch (err) {
	console.error('Error creating service files:', err)
}
