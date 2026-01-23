import { Link } from 'react-router'

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

import { renderServiceLogo } from '../../../lib/utils/render-service-logo'
import { getServiceDashboardConfigs } from '../../../lib/utils/service-configs'

export default function DashboardIndex() {
	const services = getServiceDashboardConfigs()

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle title="Services" />
			</DashboardHeader>
			<DashboardContent>
				{services.length === 0 ? (
					<div className="m-auto flex h-64 flex-col items-center justify-center space-y-6 text-center">
						<div className="bg-primary flex h-24 w-24 items-center justify-center rounded-full">
							<svg
								className="text-primary-foreground h-12 w-12"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>

						<div className="space-y-2">
							<h3 className="text-primary text-xl font-semibold">
								No Services Available
							</h3>
							<p className="text-muted-foreground max-w-md">
								There are currently no services configured. Services will appear
								here once they're added to your dashboard.
							</p>
						</div>

						<div className="flex gap-3">
							{/* TODO: Add resources */}
							<Button variant="outline" size="sm" asChild>
								<a
									href="https://github.com/gjc14/papa?tab=readme-ov-file#service"
									target="_blank"
									rel="noopener noreferrer"
								>
									Learn More
								</a>
							</Button>
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
									className="hover:bg-accent grid h-40 w-full cursor-pointer grid-rows-5 items-center gap-2 rounded-xl border p-5 transition-colors"
								>
									<div className="row-span-2 m-auto overflow-hidden rounded-lg">
										{renderServiceLogo(service.logo, 'lg')}
									</div>
									<div className="row-span-3 flex min-h-0 flex-col justify-start gap-1 overflow-hidden">
										<Tooltip>
											<TooltipTrigger asChild>
												<p className="truncate text-center font-semibold">
													{service.name}
												</p>
											</TooltipTrigger>
											<TooltipContent>
												<p>{service.name}</p>
											</TooltipContent>
										</Tooltip>
										{service.description && (
											<Tooltip>
												<TooltipTrigger asChild>
													<p className="text-muted-foreground line-clamp-3 flex-1 text-start text-sm text-pretty">
														{service.description}
													</p>
												</TooltipTrigger>
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
