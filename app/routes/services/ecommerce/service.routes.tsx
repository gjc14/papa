import { registerServiceRoutes } from '../../../lib/service/routes-registry'

registerServiceRoutes({
	dashboardRoutes: ({ route, index }) => [
		route('ecommerce', './routes/services/ecommerce/dashboard/layout.tsx', [
			index('./routes/services/ecommerce/dashboard/01_overview/route.tsx'),
			route(
				'products',
				'./routes/services/ecommerce/dashboard/02_products/layout/route.tsx',
				[
					index(
						'./routes/services/ecommerce/dashboard/02_products/01_index/route.tsx',
					),
					route(
						// multiple
						'resource',
						'./routes/services/ecommerce/dashboard/02_products/resource.ts',
					),
					route(
						':productSlug',
						'./routes/services/ecommerce/dashboard/02_products/02_product/route.tsx',
						[
							route(
								// individual
								'resource',
								'./routes/services/ecommerce/dashboard/02_products/02_product/resource.ts',
							),
						],
					),
					route(
						'brands',
						'./routes/services/ecommerce/dashboard/02_products/03_brands/route.tsx',
					),
					route(
						'brands/resource',
						'./routes/services/ecommerce/dashboard/02_products/03_brands/resource.ts',
					),
					route(
						'categories',
						'./routes/services/ecommerce/dashboard/02_products/04_categories/route.tsx',
					),
					route(
						'categories/resource',
						'./routes/services/ecommerce/dashboard/02_products/04_categories/resource.ts',
					),
					route(
						'tags',
						'./routes/services/ecommerce/dashboard/02_products/05_tags/route.tsx',
					),
					route(
						'tags/resource',
						'./routes/services/ecommerce/dashboard/02_products/05_tags/resource.ts',
					),
					route(
						'attributes',
						'./routes/services/ecommerce/dashboard/02_products/06_attributes/route.tsx',
					),
					route(
						'attributes/resource',
						'./routes/services/ecommerce/dashboard/02_products/06_attributes/resource.ts',
					),
					route(
						'reviews',
						'./routes/services/ecommerce/dashboard/02_products/07_reviews/route.tsx',
					),
				],
			),
		]),
	],
	routes: ({ route, index }) => [
		route('/store', './routes/services/ecommerce/store/layout/route.tsx', [
			index('./routes/services/ecommerce/store/index/route.tsx'),
			route(
				'product/:productSlug',
				'./routes/services/ecommerce/store/product/route.tsx',
			),
		]),
	],
})
