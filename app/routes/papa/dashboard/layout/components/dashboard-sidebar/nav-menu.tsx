import { useState } from 'react'
import { NavLink } from 'react-router'

import { ChevronRight } from 'lucide-react'

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '~/components/ui/sidebar'

export interface DashboardMenuItem {
	title: string
	icon: React.ElementType
	/**
	 * relative path to the /dashboard route
	 * @example 'assets' // will resolve to /dashboard/assets
	 */
	pathname: string
	sub?: {
		title: string
		/**
		 * relative path to the parent pathname
		 * @example 'child' // will resolve to /dashboard/assets/child
		 * */
		pathname: string
	}[]
}

interface NavMenuProps {
	items: DashboardMenuItem[]
}

// Separate component for each navigation item to handle individual state
function NavMenuItem({ item }: { item: DashboardMenuItem }) {
	const [open, setOpen] = useState(false)

	return (
		<Collapsible key={item.title} asChild open={open} onOpenChange={setOpen}>
			<SidebarMenuItem>
				<NavLink
					to={
						'/dashboard' +
						(item.pathname.startsWith('/')
							? item.pathname
							: `/${item.pathname}`)
					}
					end
					tabIndex={-1}
				>
					{({ isActive }) => (
						<SidebarMenuButton
							tooltip={item.title}
							className={`cursor-pointer ${
								isActive
									? 'bg-sidebar-accent text-sidebar-accent-foreground'
									: ''
							}`}
						>
							<item.icon />
							<span>{item.title}</span>
						</SidebarMenuButton>
					)}
				</NavLink>
				{item.sub?.length ? (
					<>
						<CollapsibleTrigger asChild>
							<SidebarMenuAction className="cursor-pointer data-[state=open]:rotate-90">
								<ChevronRight />
								<span className="sr-only">Toggle</span>
							</SidebarMenuAction>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarMenuSub>
								{item.sub?.map(subItem => (
									<SidebarMenuSubItem key={subItem.title}>
										<NavLink
											to={
												'/dashboard' +
												(item.pathname.startsWith('/')
													? item.pathname
													: `/${item.pathname}`) +
												(subItem.pathname.startsWith('/')
													? subItem.pathname
													: `/${subItem.pathname}`)
											}
											end
											tabIndex={-1}
										>
											{({ isActive }) => (
												<SidebarMenuSubButton
													className={
														isActive
															? 'bg-sidebar-accent text-sidebar-accent-foreground'
															: ''
													}
													asChild
												>
													<span>{subItem.title}</span>
												</SidebarMenuSubButton>
											)}
										</NavLink>
									</SidebarMenuSubItem>
								))}
							</SidebarMenuSub>
						</CollapsibleContent>
					</>
				) : null}
			</SidebarMenuItem>
		</Collapsible>
	)
}

export function NavMenu({ items }: NavMenuProps) {
	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map(item => (
					<NavMenuItem key={item.title} item={item} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
