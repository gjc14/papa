import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

import { askInput } from './utils'

const createPaths = (websiteName: string) => {
	const serviceRoutesPath = join(
		process.cwd(),
		`app/routes/services/${websiteName}/service.routes.tsx`,
	)

	const layoutPath = join(
		process.cwd(),
		`app/routes/services/${websiteName}/layout.tsx`,
	)

	const indexPath = join(
		process.cwd(),
		`app/routes/services/${websiteName}/index.tsx`,
	)

	const aboutPath = join(
		process.cwd(),
		`app/routes/services/${websiteName}/about.tsx`,
	)

	return { serviceRoutesPath, layoutPath, indexPath, aboutPath }
}

const createTemplates = (websiteName: string) => {
	const websiteServiceRoutes = `
// Please do not use alias "~", use relative path instead
// Because service registration runs at the same level as \`vite.config.ts\`, and not as part of the bundled code.
import { registerServiceRoutes } from '../../../lib/service/routes-registry'

registerServiceRoutes({
	routes: ({ route, index }) => [
		route('/${websiteName}', './routes/services/${websiteName}/layout.tsx', [
			index('./routes/services/${websiteName}/index.tsx'),
			route('about', './routes/services/${websiteName}/about.tsx'),
		]),
	],
})

`

	const websiteLayout = `
import { Link, Outlet } from 'react-router'

import { Button } from '~/components/ui/button'

export default function WebsiteLayout() {
	return (
		<div className="flex min-h-svh flex-col">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="text-2xl">🍟</span>
						</div>

						<nav className="flex items-center">
							<Button asChild variant={'link'}>
								<Link to="/${websiteName}">Website</Link>
							</Button>
							<Button asChild variant={'link'}>
								<Link to="/${websiteName}/about">About</Link>
							</Button>
						</nav>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t">
				<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
					<div className="text-muted-foreground text-center">
						<p>Footer</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

`

	const websiteIndex = `
import type { Route } from './+types/index'

export const action = async ({ request, params }: Route.ActionArgs) => {
	return {}
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	return {}
}

export default function Website() {
	return (
		<div className="flex flex-1 items-center justify-center py-16">
			<div className="mx-auto px-4 text-center">
				<h1 className="text-4xl font-bold">Example Website Page</h1>
				<p className="text-muted-foreground">Any content goes here!</p>
			</div>
		</div>
	)
}

`

	const websiteAbout = `
import type { Route } from './+types/about'

export const action = async ({ request, params }: Route.ActionArgs) => {
	return {}
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	return {}
}

export default function About() {
	return (
		<div className="flex flex-1 items-center justify-center py-16">
			<div className="mx-auto px-4 text-center">
				<h1 className="text-4xl font-bold">About Page</h1>
				<p className="text-muted-foreground">Any content goes here!</p>
			</div>
		</div>
	)
}

`

	return { websiteServiceRoutes, websiteLayout, websiteIndex, websiteAbout }
}

try {
	const newWebsite = await askInput('Create new website', 'my-website')

	// Create directories
	await mkdir(join(process.cwd(), `app/routes/services/${newWebsite}`), {
		recursive: true,
	})

	const { serviceRoutesPath, layoutPath, indexPath, aboutPath } =
		createPaths(newWebsite)
	const { websiteServiceRoutes, websiteLayout, websiteIndex, websiteAbout } =
		createTemplates(newWebsite)

	// Write all service files
	await writeFile(serviceRoutesPath, websiteServiceRoutes.trim())
	await writeFile(layoutPath, websiteLayout.trim())
	await writeFile(indexPath, websiteIndex.trim())
	await writeFile(aboutPath, websiteAbout.trim())

	console.log(
		`🎉 Website [${newWebsite}] created successfully!

		+ 4 files created:
		1️⃣ ${serviceRoutesPath.split('app/routes')[1]}
		2️⃣ ${layoutPath.split('app/routes')[1]}
		3️⃣ ${indexPath.split('app/routes')[1]}
		4️⃣ ${aboutPath.split('app/routes')[1]}
        
        -> Navigate to '/${newWebsite}' to see the new website
        -> Navigate to '/${newWebsite}/about' to see the about page
        `.replace(/^[ \t]+/gm, ''),
	)
} catch (err) {
	console.error('Error creating service files:', err)
}
