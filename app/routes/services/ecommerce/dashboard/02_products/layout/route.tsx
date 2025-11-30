import type { Route } from './+types/route'
import { Outlet } from 'react-router'

import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from '~/components/error-boundary-template'
import {
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/routes/papa/dashboard/components/dashboard-wrapper'

export default function ECProductsLayout({}: Route.ComponentProps) {
	return <Outlet />
}

export function ErrorBoundary() {
	return (
		<ErrorBoundaryTemplate>
			{props => <ErrorTemplate {...props} />}
		</ErrorBoundaryTemplate>
	)
}

const ErrorTemplate = ({
	status,
	statusMessage,
}: ErrorBoundaryTemplateProps) => {
	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle
					title={`${status} ${statusMessage.text}`}
					description={statusMessage.description}
				/>
			</DashboardHeader>
		</DashboardLayout>
	)
}
