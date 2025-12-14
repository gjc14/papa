import type { Route } from './+types/route'
import { Outlet } from 'react-router'

import {
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/components/dashboard/dashboard-wrapper'
import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from '~/components/error-boundary-template'

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
