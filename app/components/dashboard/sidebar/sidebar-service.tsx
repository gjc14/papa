import { Link } from 'react-router'

import { ChevronsUpDown } from 'lucide-react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '~/components/ui/sidebar'

import { renderServiceLogo } from '../../../lib/utils/render-service-logo'

export interface ServiceDashboardConfig {
	/**
	 * Name of the service.
	 */
	name: string
	/**
	 * Can be an svg or an image URL
	 * ```
	 * // For svg, you could either pass in your own svg or utilize icon libraries:
	 * import { Command } from 'lucide-react'
	 * import { AvocadoIcon } from '@phosphor-icons/react'
	 * import { mySVG } from './my-svg' // your own svg as a React component. e.g. export const mySVG = () => (<svg>...</svg>)
	 * {
	 * 		// ...
	 * 		logo: AvocadoIcon // or Command
	 * }
	 *
	 * // For image URL, use:
	 * import mySVGLogo from './my-svg.svg'
	 * import myPNGLogo from './my-logo.png'
	 *
	 * {
	 * 		// ...
	 * 		logo: '/your-logo.png' // to directly point to an image in public folder or use `mySVGLogo`, `myPNGLogo` imported from your file
	 * }
	 * ```
	 */
	logo: React.ElementType | string
	/**
	 * The absolute URL path for the service. If you want to utilize dashboard sidebar, this should start with `/dashboard/`.
	 * @example '/dashboard/my-service'
	 */
	pathname: string
	/**
	 * Optional description of the service.
	 */
	description?: string
}

export function SidebarService({
	services,
	currentService,
}: {
	services: ServiceDashboardConfig[]
	currentService?: ServiceDashboardConfig
}) {
	const { isMobile } = useSidebar()

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					{currentService && (
						<DropdownMenuTrigger
							render={
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<div className="flex aspect-square size-8 items-center justify-center overflow-hidden border">
										{renderServiceLogo({
											logo: currentService.logo,
											className: 'size-8',
										})}
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{currentService.name}
										</span>
										<span className="text-muted-foreground truncate text-xs">
											Startup
										</span>
									</div>
									<ChevronsUpDown className="ml-auto" />
								</SidebarMenuButton>
							}
						/>
					)}
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
						align="start"
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-muted-foreground text-xs">
								Services
							</DropdownMenuLabel>
							{services.map(service => (
								<DropdownMenuItem
									className="[& gap-2 p-2"
									render={
										<Link key={service.name} to={service.pathname}>
											<div className="flex size-6 items-center justify-center overflow-hidden border [&_svg]:size-4">
												{renderServiceLogo({
													logo: service.logo,
													className: 'size-6',
												})}
											</div>
											{service.name}
											{/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
										</Link>
									}
								/>
							))}
							{/* <DropdownMenuSeparator />
							<DropdownMenuItem className="gap-2 p-2">
								<div className="flex size-6 items-center justify-center overflow-hidden border">
									<Plus className="size-4" />
								</div>
								<div className="text-muted-foreground font-medium">
									Add service
								</div>
							</DropdownMenuItem> */}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
