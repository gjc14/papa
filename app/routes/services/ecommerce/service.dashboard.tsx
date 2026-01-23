import { Apple, BadgeDollarSign, Handshake, Package, Store } from 'lucide-react'

import { registerServiceDashboard } from '~/lib/service/dashboard-registry'

registerServiceDashboard({
	name: 'E-Commerce',
	description: 'Design your storefront with website design AI in React!',
	logo: Store,
	pathname: '/dashboard/ecommerce',
	sidebar: {
		primary: [
			{
				icon: Store,
				title: 'Dashboard',
				pathname: 'ecommerce',
			},
			{
				icon: Handshake,
				title: 'Orders',
				pathname: 'ecommerce/orders',
			},
			{
				icon: Apple,
				title: 'Products',
				pathname: 'ecommerce/products',
				sub: [
					{
						title: 'Create Product',
						pathname: 'new',
					},
					{
						title: 'Brands',
						pathname: 'brands',
					},
					{
						title: 'Categories',
						pathname: 'categories',
					},
					{
						title: 'Tags',
						pathname: 'tags',
					},
					{
						title: 'Attributes',
						pathname: 'attributes',
					},
					{
						title: 'Reviews',
						pathname: 'reviews',
					},
				],
			},
			{
				icon: Package,
				title: 'Inventory',
				pathname: 'ecommerce/inventory',
			},
			{
				icon: BadgeDollarSign,
				title: 'Promotions',
				pathname: 'ecommerce/promotions',
			},
		],
	},
})
