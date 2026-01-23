import * as React from 'react'
import { Link } from 'react-router'

import { type LucideIcon } from 'lucide-react'

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '~/components/ui/sidebar'

export type SidebarSecondaryItem =
	| {
			title: string
			url: string
			icon: LucideIcon
			action?: never
	  }
	| {
			title: string
			action: () => void
			icon: LucideIcon
			url?: never
	  }

export function SidebarSecondary({
	items,
	...props
}: {
	items: SidebarSecondaryItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map(item => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								size="default"
								onClick={item.action ? () => item.action() : undefined}
							>
								{item.url ? (
									<Link to={item.url}>
										<item.icon />
										<span>{item.title}</span>
									</Link>
								) : (
									<span className="cursor-pointer">
										<item.icon />
										<span>{item.title}</span>
									</span>
								)}
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
