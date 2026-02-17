import {
	AvocadoIcon,
	HandshakeIcon,
	PackageIcon,
	SealPercentIcon,
	StorefrontIcon,
} from '@phosphor-icons/react'

import { registerServiceDashboard } from '~/lib/service/dashboard-registry'

registerServiceDashboard({
	name: 'E-Commerce',
	description: 'Design your storefront with website design AI in React!',
	logo: StorefrontIcon,
	pathname: '/dashboard/ecommerce',
	sidebar: {
		primary: [
			{
				icon: StorefrontIcon,
				title: 'Dashboard',
				pathname: 'ecommerce',
			},
			{
				icon: HandshakeIcon,
				title: 'Orders',
				pathname: 'ecommerce/orders',
			},
			{
				icon: AvocadoIcon,
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
				icon: PackageIcon,
				title: 'Inventory',
				pathname: 'ecommerce/inventory',
			},
			{
				icon: SealPercentIcon,
				title: 'Promotions',
				pathname: 'ecommerce/promotions',
			},
		],
	},
})
