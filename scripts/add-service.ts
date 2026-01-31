import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

import { askInput } from './utils'

const createPaths = (serviceName: string, frontendRouteName: string) => {
	const serviceRoutesPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/service.routes.ts`,
	)

	const serviceDashboardPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/service.dashboard.ts`,
	)

	const serviceSystemEndpointsPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/service.system-endpoints.ts`,
	)

	const dashboardLayoutPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/dashboard/layout.tsx`,
	)

	const dashboardIndexPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/dashboard/index.tsx`,
	)

	const dashboardProductRoutePath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/dashboard/product/route.tsx`,
	)

	const storeDataPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/data.ts`,
	)

	const storeLayoutPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/${frontendRouteName}/layout.tsx`,
	)

	const storeIndexPath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/${frontendRouteName}/index.tsx`,
	)

	const productRoutePath = join(
		process.cwd(),
		`app/routes/services/${serviceName}/${frontendRouteName}/product/route.tsx`,
	)

	return {
		serviceRoutesPath,
		serviceDashboardPath,
		serviceSystemEndpointsPath,
		dashboardLayoutPath,
		dashboardIndexPath,
		dashboardProductRoutePath,
		storeDataPath,
		storeLayoutPath,
		storeIndexPath,
		productRoutePath,
	}
}

const createTemplates = (serviceName: string, frontendRouteName: string) => {
	const serviceRoutes = `
// Please do not use alias "~", use relative path instead
// Because service registration runs at the same level as \`vite.config.ts\`, and not as part of the bundled code.
import { registerServiceRoutes } from '../../../lib/service/routes-registry'

registerServiceRoutes({
	dashboardRoutes: ({ route, index }) => [
		route(
			'${serviceName}',
			'./routes/services/${serviceName}/dashboard/layout.tsx',
			[
				index('./routes/services/${serviceName}/dashboard/index.tsx'),
				route(
					':productId',
					'./routes/services/${serviceName}/dashboard/product/route.tsx',
				),
			],
		),
	],

	routes: ({ route, index }) => [
		route(
			'/${frontendRouteName}',
			'./routes/services/${serviceName}/${frontendRouteName}/layout.tsx',
			[
				index('./routes/services/${serviceName}/${frontendRouteName}/index.tsx'),
				route(
					':productId',
					'./routes/services/${serviceName}/${frontendRouteName}/product/route.tsx',
				),
			],
		),
	],
})

`

	const serviceDashboard = `
import { Apple, Command } from 'lucide-react'

import { registerServiceDashboard } from '~/lib/service/dashboard-registry'

registerServiceDashboard({
	name: '${serviceName}',
	description: 'This is an example service for demonstration purposes.',
	logo: Command,
	pathname: '/dashboard/${serviceName}',
	// sidebar config is how you set sidebar in /dashboard, if you're not using /dashboard, this could be omitted.
	sidebar: {
		primary: [
			{
				icon: Apple,
				title: 'Products',
				pathname: '${serviceName}',
				sub: [
					{
						title: 'たいわんラーメン',
						pathname: 'たいわんラーメン',
					},
				],
			},
		],
	}
})

`

	const serviceSitemap = `
import { registerSystemEndpoints } from '~/lib/service/system-endpoints-registry'

import { products } from './data'

// Simulate async data fetching
const getProducts = async () => products

registerSystemEndpoints({
	sitemap: async url => {
		const products = await getProducts()

		return products.map(product => ({
			loc: \`/${frontendRouteName}/\${product.id}\`,
			lastmod: new Date(),
			changefreq: 'weekly',
			priority: 0.5,
		}))
	},
})

`

	const dashboardLayout = `
import { Link, Outlet } from 'react-router'

import { Button } from '~/components/ui/button'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/components/dashboard/dashboard-wrapper'

export default function ExampleDashboardLayout() {
	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="🍜 Shop Dashboard" />
				<DashboardActions>
					{/* You may put some buttons here */}
					<Button variant={'ghost'} className="border-2 border-dashed" render={<Link to="/${frontendRouteName}">Go to Example Shop</Link>} />
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent>
				{/* This will renders the nested routes */}
				<Outlet />
			</DashboardContent>
		</DashboardLayout>
	)
}

`

	const dashboardIndex = `
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'

export default function ExampleDashboardIndex() {
	return (
		<div className="mb-3 flex w-full flex-1 flex-col items-start justify-start gap-6 border p-2 md:mb-5">
			<h2>
				List <span className="text-muted-foreground text-base">index page</span>
			</h2>

			<div>
				<ul className="list-inside list-disc">
					<li>
						<Button variant={'link'} className="p-0" render={<Link to="たいわんラーメン">たいわんラーメン (Taiwan ramen)</Link>} />
					</li>
					<li>
						<Button variant={'link'} className="p-0" render={<Link to="はかたラーメン">はかたラーメン (Hakata ramen)</Link>} />
					</li>
				</ul>
			</div>
		</div>
	)
}

`

	const dashboardProductRoute = `
import type { Route } from './+types/route'
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'

export default function ExampleDashboardSub({ params }: Route.ComponentProps) {
	return (
		<div className="mb-3 flex w-full flex-1 flex-col items-center justify-center border md:mb-5">
			<h3 className="text-6xl">🍜</h3>
			<p>{params.productId} Page</p>

			<Button variant={'outline'} className="mt-5" render={<Link to="..">Back to products list</Link>} />
		</div>
	)
}

`

	const storeData = `
export const products = [
	{
		id: '1',
		name: 'たいわんラーメン',
		price: 99,
		image: '🍜',
		description: 'Taiwan ramen',
	},
	{
		id: '2',
		name: 'はかたラーメン',
		price: 99,
		image: '🍜',
		description: 'Hakata ramen',
	},
]

`

	const storeLayout = `
import { Link, Outlet } from 'react-router'

import { Button } from '~/components/ui/button'

export default function ShopLayout() {
	return (
		<main className="min-h-svh p-8">
			<div className="max-w-4xl flex flex-col items-center gap-2 mx-auto">
				<Link to="/${frontendRouteName}">
					<h1 className="underline-offset-4 hover:underline">
						🍜 Example Shop
					</h1>
				</Link>

				<Button
					variant={'ghost'}
					className="mb-8 border-dashed border-2"
					render={<Link to="/dashboard/${serviceName}">See Dashboard</Link>}
				/>
			</div>

			<Outlet />
		</main>
	)
}
`

	const storeIndex = `
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'

import { products } from '../data'

export default function Shop() {
	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{products.map(product => (
					<Card key={product.id} className="transition-shadow hover:shadow-lg">
						<CardContent className="flex flex-col gap-2 text-center">
							<div className="text-8xl">{product.image}</div>
							<h1 className="text-3xl font-bold">{product.name}</h1>
							<p className="pt-3 text-3xl font-bold">
								$ {product.price.toLocaleString()}
							</p>
						</CardContent>
						<CardFooter>
							<Button className="w-full" render={<Link to={\`\${product.id}\`}>View Details</Link>} />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	)
}

`

	const productRoute = `
import type { Route } from './+types/route'
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'

import { products } from '../../data'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const productId = params.productId
	const product = products.find(p => p.id === productId)

	if (!product) {
		throw new Response('Product not found', { status: 404 })
	}

	return { product }
}

export default function ProductPage({ loaderData }: Route.ComponentProps) {
	const { product } = loaderData

	return (
		<div className="mx-auto max-w-2xl">
			<Card>
				<CardContent className="flex flex-col gap-2 text-center">
					<div className="text-8xl">{product.image}</div>
					<h1 className="text-3xl font-bold">{product.name}</h1>
					<p className="text-muted-foreground">{product.description}</p>
					<p className="pt-3 text-3xl font-bold">
						$ {product.price.toLocaleString()}
					</p>
				</CardContent>
				<CardFooter className="flex-col gap-3">
					<Button size="lg" className="w-full">
						Add to Cart
					</Button>
					<Button variant="outline" size="lg" className="w-full" render={<Link to="/${frontendRouteName}">← Back to Shop</Link>} />
				</CardFooter>
			</Card>
		</div>
	)
}

`

	return {
		serviceRoutes,
		serviceDashboard,
		serviceSitemap,
		dashboardLayout,
		dashboardIndex,
		dashboardProductRoute,
		storeData,
		storeLayout,
		storeIndex,
		productRoute,
	}
}

try {
	const serviceName = await askInput('Create new service', 'my-service')
	const frontendRouteName = await askInput('Service frontend route', 'my-store')

	// Create directories
	await mkdir(join(process.cwd(), `app/routes/services/${serviceName}`), {
		recursive: true,
	})
	await mkdir(
		join(process.cwd(), `app/routes/services/${serviceName}/dashboard/product`),
		{ recursive: true },
	)
	await mkdir(
		join(
			process.cwd(),
			`app/routes/services/${serviceName}/${frontendRouteName}`,
		),
		{
			recursive: true,
		},
	)
	await mkdir(
		join(
			process.cwd(),
			`app/routes/services/${serviceName}/${frontendRouteName}/product`,
		),
		{ recursive: true },
	)

	const {
		serviceRoutesPath,
		serviceDashboardPath,
		serviceSystemEndpointsPath,
		dashboardLayoutPath,
		dashboardIndexPath,
		dashboardProductRoutePath,
		storeDataPath,
		storeLayoutPath,
		storeIndexPath,
		productRoutePath,
	} = createPaths(serviceName, frontendRouteName)

	const {
		serviceRoutes,
		serviceDashboard,
		serviceSitemap,
		dashboardLayout,
		dashboardIndex,
		dashboardProductRoute,
		storeData,
		storeLayout,
		storeIndex,
		productRoute,
	} = createTemplates(serviceName, frontendRouteName)

	// Write all service files
	await writeFile(serviceRoutesPath, serviceRoutes.trim())
	await writeFile(serviceDashboardPath, serviceDashboard.trim())
	await writeFile(serviceSystemEndpointsPath, serviceSitemap.trim())
	await writeFile(dashboardLayoutPath, dashboardLayout.trim())
	await writeFile(dashboardIndexPath, dashboardIndex.trim())
	await writeFile(dashboardProductRoutePath, dashboardProductRoute.trim())
	await writeFile(storeDataPath, storeData.trim())
	await writeFile(storeLayoutPath, storeLayout.trim())
	await writeFile(storeIndexPath, storeIndex.trim())
	await writeFile(productRoutePath, productRoute.trim())

	console.log(
		`🎉 Service [${serviceName}] created successfully!

		+ 10 files created:
		1️⃣ ${serviceRoutesPath.split('app/routes')[1]}
		2️⃣ ${serviceDashboardPath.split('app/routes')[1]}
		3️⃣ ${serviceSystemEndpointsPath.split('app/routes')[1]}
		4️⃣ ${dashboardLayoutPath.split('app/routes')[1]}
		5️⃣ ${dashboardIndexPath.split('app/routes')[1]}
		6️⃣ ${dashboardProductRoutePath.split('app/routes')[1]}
		7️⃣ ${storeDataPath.split('app/routes')[1]}
		8️⃣ ${storeLayoutPath.split('app/routes')[1]}
		9️⃣ ${storeIndexPath.split('app/routes')[1]}
		🔟 ${productRoutePath.split('app/routes')[1]}

        -> Navigate to '/${frontendRouteName}' to see the frontend
        -> Navigate to '/dashboard/${serviceName}' to see the dashboard
        `.replace(/^[ \t]+/gm, ''),
	)
} catch (err) {
	console.error('Error creating service files:', err)
}
