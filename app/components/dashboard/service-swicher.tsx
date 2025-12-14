import { Link } from 'react-router'

import { ChevronsUpDown } from 'lucide-react'

import {
	DropdownMenu,
	DropdownMenuContent,
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

import { renderServiceLogo } from '../../routes/papa/utils/render-service-logo'

export interface ServiceDashboardConfig {
	/**
	 * Name of the service.
	 */
	name: string
	/**
	 * Can be a React component or an image URL
	 * ```
	 * // For React component, use:
	 * import { Command } from 'lucide-react'
	 * // ...
	 * logo: Command
	 *
	 * // For image URL, use:
	 * logo: '/your-logo.png'
	 *
	 * // For SVG/PNG path, use:
	 * import mySVGLogo from './my-logo.svg'
	 * import myPNGLogo from './my-logo.png'
	 * // ...
	 * logo: mySVGLogo
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

export function ServiceSwitcher({
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
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg border">
									{renderServiceLogo(currentService.logo, 'lg')}
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{currentService.name}
									</span>
									<span className="truncate text-xs">{'Start Up'}</span>
								</div>
								<ChevronsUpDown className="ml-auto" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
					)}
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Services
						</DropdownMenuLabel>
						{services.map(service => (
							<Link key={service.name} to={service.pathname}>
								<DropdownMenuItem className="gap-2 p-2">
									<div className="flex size-6 items-center justify-center overflow-hidden rounded-sm border">
										{renderServiceLogo(service.logo, 'sm')}
									</div>
									{service.name}
									{/* <DropdownMenuShortcut>
                                    ⌘{index + 1}
                                </DropdownMenuShortcut> */}
								</DropdownMenuItem>
							</Link>
						))}
						{/* <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">
                                Add service
                            </div>
                        </DropdownMenuItem> */}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
