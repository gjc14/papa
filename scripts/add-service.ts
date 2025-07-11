import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const exampleServiceConfig = `
import { index, route } from '@react-router/dev/routes'
import { Apple, Command } from 'lucide-react'

import type { Service } from '../../papa/utils/get-service-configs'

export const config = {
	dashboard: {
		name: 'Example Service',
		description: 'This is an example service for demonstration purposes.',
		logo: Command,
		pathname: '/dashboard/example-service',
		routes: [
			route(
				'example-service',
				'./routes/services/example-service/dashboard/layout.tsx',
				[
					index('./routes/services/example-service/dashboard/index.tsx'),
					route(
						':productId',
						'./routes/services/example-service/dashboard/product/route.tsx',
					),
				],
			),
		],
		sidebar: [
			{
				icon: Apple,
				title: 'Products',
				pathname: 'example-service',
				sub: [
					{
						title: 'Product ID: 123',
						pathname: '123',
					},
				],
			},
		],
	},
	routes: [
		route(
			'/example-shop',
			'./routes/services/example-service/shop/layout.tsx',
			[
				index('./routes/services/example-service/shop/index.tsx'),
				route(
					':productId',
					'./routes/services/example-service/shop/product/route.tsx',
				),
			],
		),
	],
} satisfies Service
`

const exampleDashboardIndex = `
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'

export default function ExampleDashboardIndex() {
	return (
		<div className="w-full flex-1 mx-auto p-8 bg-accent">
			<p>Example Shop Dashboard - Index Page</p>

			<Button asChild className="mt-3">
				<Link to="123">See Product 123</Link>
			</Button>
		</div>
	)
}
`

const exampleDashboardLayout = `
import { Link, Outlet } from 'react-router'

import { Button } from '~/components/ui/button'

export default function ExampleDashboardLayout() {
	return (
		<section className="w-full flex-1 mx-auto">
			<div className="max-w-4xl flex flex-col items-center gap-2 mx-auto">
				<h1>🍜 Example Shop Dashboard</h1>

				<Button
					asChild
					variant={'ghost'}
					className="mb-8 border-dashed border-2"
				>
					<Link to="/example-shop">Go to Example Shop</Link>
				</Button>
			</div>

			<Outlet />
		</section>
	)
}
`

const exampleDashboardProductRoute = `
import type { Route } from './+types/route'

export const loader = async ({ params }: Route.LoaderArgs) => {
	const productId = params.productId
	return { productId }
}

export default function ExampleDashboardSub({
	loaderData,
}: Route.ComponentProps) {
	return (
		<div className="w-full flex-1 mx-auto p-8 bg-accent">
			<p>Example Service Dashboard - Product Id {loaderData.productId} Page</p>
		</div>
	)
}
`

const exampleShopIndex = `
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'

import { products } from './data'

export default function Shop() {
	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{products.map(product => (
					<Card key={product.id} className="hover:shadow-lg transition-shadow">
						<CardContent className="p-6 text-center">
							<div className="text-6xl mb-4">{product.image}</div>
							<h3 className="font-medium mb-2">{product.name}</h3>
							<p className="text-lg font-bold text-blue-600 mb-4">
								NT$ {product.price.toLocaleString()}
							</p>
							<Button asChild className="w-full">
								<Link to={\`\${product.id}\`}>View Details</Link>
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
`

const exampleShopLayout = `
import { Link, Outlet } from 'react-router'

import { Button } from '~/components/ui/button'

export default function ShopLayout() {
	return (
		<main className="min-h-svh p-8">
			<div className="max-w-4xl flex flex-col items-center gap-2 mx-auto">
				<Link to="/example-shop">
					<h1 className="underline-offset-4 hover:underline">
						🍜 Example Shop
					</h1>
				</Link>

				<Button
					asChild
					variant={'ghost'}
					className="mb-8 border-dashed border-2"
				>
					<Link to="/dashboard/example-service">See Dashboard</Link>
				</Button>
			</div>

			<Outlet />
		</main>
	)
}
`

const exampleShopData = `
export const products = [
	{
		id: '1',
		name: 'Papa super',
		price: 10000,
		image: '🍟🍟',
		description: 'Deeelicious',
	},
	{
		id: '2',
		name: 'Papa pequeño',
		price: 5000,
		image: '🍟',
		description: 'Deeelicious',
	},
]
`

const exampleProductRoute = `
import type { Route } from './+types/route'
import { Link } from 'react-router'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'

import { products } from '../data'

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
		<div className="max-w-2xl mx-auto">
			<Card>
				<CardContent className="p-8 text-center">
					<div className="text-8xl mb-6">{product.image}</div>
					<h1 className="text-3xl font-bold mb-4">{product.name}</h1>
					<p className="text-gray-600 mb-6">{product.description}</p>
					<p className="text-3xl font-bold text-blue-600 mb-8">
						NT$ {product.price.toLocaleString()}
					</p>

					<div className="space-y-4">
						<Button size="lg" className="w-full">
							Add to Cart
						</Button>
						<Button variant="outline" size="lg" asChild className="w-full">
							<Link to="/example-shop">← Back to Shop</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
`

// File paths for example service
const filePathServiceConfig = join(
	process.cwd(),
	'app/routes/services/example-service/config.tsx',
)

const filePathDashboardIndex = join(
	process.cwd(),
	'app/routes/services/example-service/dashboard/index.tsx',
)

const filePathDashboardLayout = join(
	process.cwd(),
	'app/routes/services/example-service/dashboard/layout.tsx',
)

const filePathDashboardProductRoute = join(
	process.cwd(),
	'app/routes/services/example-service/dashboard/product/route.tsx',
)

const filePathShopIndex = join(
	process.cwd(),
	'app/routes/services/example-service/shop/index.tsx',
)

const filePathShopLayout = join(
	process.cwd(),
	'app/routes/services/example-service/shop/layout.tsx',
)

const filePathShopData = join(
	process.cwd(),
	'app/routes/services/example-service/shop/data.ts',
)

const filePathProductRoute = join(
	process.cwd(),
	'app/routes/services/example-service/shop/product/route.tsx',
)

try {
	// Create directories
	await mkdir(join(process.cwd(), 'app/routes/services/example-service'), {
		recursive: true,
	})
	await mkdir(
		join(
			process.cwd(),
			'app/routes/services/example-service/dashboard/product',
		),
		{
			recursive: true,
		},
	)
	await mkdir(join(process.cwd(), 'app/routes/services/example-service/shop'), {
		recursive: true,
	})
	await mkdir(
		join(process.cwd(), 'app/routes/services/example-service/shop/product'),
		{
			recursive: true,
		},
	)

	// Write all service files
	await writeFile(filePathServiceConfig, exampleServiceConfig.trim())
	await writeFile(filePathDashboardIndex, exampleDashboardIndex.trim())
	await writeFile(filePathDashboardLayout, exampleDashboardLayout.trim())
	await writeFile(
		filePathDashboardProductRoute,
		exampleDashboardProductRoute.trim(),
	)
	await writeFile(filePathShopIndex, exampleShopIndex.trim())
	await writeFile(filePathShopLayout, exampleShopLayout.trim())
	await writeFile(filePathShopData, exampleShopData.trim())
	await writeFile(filePathProductRoute, exampleProductRoute.trim())

	console.log(
		`🎉 Example service files created successfully!

		📁 Created 8 files:
		1️⃣ ${filePathServiceConfig.split('app/routes')[1]}
		2️⃣ ${filePathDashboardIndex.split('app/routes')[1]}
		3️⃣ ${filePathDashboardLayout.split('app/routes')[1]}
		4️⃣ ${filePathDashboardProductRoute.split('app/routes')[1]}
		5️⃣ ${filePathShopIndex.split('app/routes')[1]}
		6️⃣ ${filePathShopLayout.split('app/routes')[1]}
		7️⃣ ${filePathShopData.split('app/routes')[1]}
		8️⃣ ${filePathProductRoute.split('app/routes')[1]}
        
        🏄 Navigate to '/example-shop' to see the shop in action
        🎛️ Navigate to '/dashboard/example-service' to see the dashboard
        `.replace(/^[ \t]+/gm, ''),
	)
} catch (err) {
	console.error('Error creating example service files:', err)
}
