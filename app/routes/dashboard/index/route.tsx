import { Link } from 'react-router'

import { StackIcon } from '@phosphor-icons/react'

import { Button } from '~/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/components/dashboard/dashboard-wrapper'
import { getServicesDashboards } from '~/lib/service/dashboard'

import { renderServiceLogo } from '../../../lib/utils/render-service-logo'

export default function DashboardIndex() {
	const services = getServicesDashboards()

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Services" />
			</DashboardHeader>
			<DashboardContent>
				{services.length === 0 ? (
					<div className="m-auto flex h-64 flex-col items-center justify-center space-y-6 text-center">
						<div className="bg-primary flex h-20 w-20 items-center justify-center rounded-full">
							<StackIcon className="text-background size-12" />
						</div>

						<div className="space-y-2">
							<h3 className="text-xl font-semibold">No Services Available</h3>
							<p className="text-muted-foreground max-w-md text-sm">
								There are currently no services configured. Services will appear
								here once they're added to your dashboard.
							</p>
						</div>

						<div className="flex gap-3">
							{/* TODO: Add resources */}
							<Button
								variant="outline"
								size="sm"
								render={
									<a
										href="https://github.com/gjc14/papa?tab=readme-ov-file#service"
										target="_blank"
										rel="noopener noreferrer"
									>
										Learn More
									</a>
								}
							/>
							<Button size="sm">Get Started</Button>
						</div>
					</div>
				) : (
					<TooltipProvider>
						<div className="grid h-fit w-full grid-cols-2 gap-3 overflow-auto md:grid-cols-3 xl:grid-cols-4">
							{services.map((service, index) => (
								<Link
									key={index}
									to={service.pathname}
									className="hover:bg-accent grid h-40 w-full cursor-pointer grid-rows-5 items-center gap-2 border p-5 transition-colors"
								>
									<div className="row-span-2 m-auto overflow-hidden">
										{renderServiceLogo(service.logo, 'lg')}
									</div>
									<div className="row-span-3 flex min-h-0 flex-col justify-start gap-1 overflow-hidden">
										<Tooltip>
											<TooltipTrigger
												render={
													<p className="truncate text-center font-semibold">
														{service.name}
													</p>
												}
											/>
											<TooltipContent>
												<p>{service.name}</p>
											</TooltipContent>
										</Tooltip>
										{service.description && (
											<Tooltip>
												<TooltipTrigger
													render={
														<p className="text-muted-foreground line-clamp-3 flex-1 text-start text-sm text-pretty">
															{service.description}
														</p>
													}
												/>
												<TooltipContent>
													<p className="max-w-xs">{service.description}</p>
												</TooltipContent>
											</Tooltip>
										)}
									</div>
								</Link>
							))}
						</div>
					</TooltipProvider>
				)}
			</DashboardContent>
		</DashboardLayout>
	)
}
