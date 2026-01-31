import React from 'react'
import { NavLink, useLocation } from 'react-router'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import { capitalize } from '~/lib/utils'

export const HeaderWithBreadcrumbs = () => {
	return (
		<header className="flex w-full shrink-0 items-center gap-2 overflow-scroll border-b px-4 py-2">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1 cursor-pointer" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<DashboardBreadcrumbs />
			</div>
			{/* <div className="ml-auto flex items-center gap-2">
				<Button size="sm">Hey Yo</Button>
			</div> */}
		</header>
	)
}

const DashboardBreadcrumbs = () => {
	const { pathname } = useLocation()
	const paths = pathname.split('/').filter(Boolean)

	const getPathName = (path: string) => {
		return decodeURIComponent(path)
			.replace(/[-_]/g, ' ')
			.split(' ')
			.map(word => capitalize(word))
			.join(' ')
	}

	return (
		<Breadcrumb>
			<BreadcrumbList className="flex w-full flex-nowrap">
				{paths.map((path, i) => {
					const link = `/${paths.slice(0, i + 1).join('/')}`
					const name = getPathName(path)

					return (
						<React.Fragment key={i}>
							<Tooltip>
								<TooltipProvider>
									<TooltipTrigger
										render={
											<BreadcrumbItem>
												<NavLink
													to={link}
													className={({ isActive }) =>
														`${isActive ? 'text-primary' : 'hover:text-primary'} max-w-20 overflow-hidden text-sm text-nowrap text-ellipsis md:max-w-36`
													}
													end
												>
													{name}
												</NavLink>
											</BreadcrumbItem>
										}
									/>
									<TooltipContent>{name}</TooltipContent>
								</TooltipProvider>
							</Tooltip>
							{/* Add separator except last one */}
							{i < paths.length - 1 && (
								<BreadcrumbSeparator className="size-3" />
							)}
						</React.Fragment>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
