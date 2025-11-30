import { isRouteErrorResponse, useRouteError } from 'react-router'

import { statusCodeMap } from '~/lib/utils/status-code'

export type ErrorBoundaryTemplateProps = {
	status: number
	statusMessage: {
		text: string
		description: string
	}
	errorMessage: string
}

/**
 * A reusable Error Boundary Template component for handling route errors.
 *
 * @example
 * export function ErrorBoundary() {
 * 	return (
 * 		<ErrorBoundaryTemplate>
 * 			{props => <ErrorTemplate {...props} />}
 * 		</ErrorBoundaryTemplate>
 * 	)
 * }
 *
 * const ErrorTemplate = ({ status, statusMessage }: ErrorBoundaryTemplateProps) => {
 * 	return (
 * 		<main className="flex h-svh w-screen flex-col items-center justify-center">
 * 			<p>
 * 				{status} {statusMessage.text}
 * 			</p>
 * 			<p className="text-muted-foreground">{statusMessage.description}</p>
 * 		</main>
 * 	)
 * }
 *
 */
export function ErrorBoundaryTemplate({
	children,
}: {
	children: ({
		status,
		statusMessage,
		errorMessage,
	}: ErrorBoundaryTemplateProps) => React.ReactNode
}) {
	const error = useRouteError()

	let statusMessage = statusCodeMap[500]

	// Route throw new Response (404, etc.)
	if (isRouteErrorResponse(error)) {
		statusMessage = statusCodeMap[error.status]
		console.error('Admin Route Error Response:', error)

		const errorMessage = error.data || 'Error Response'

		return children({
			status: error.status,
			statusMessage,
			errorMessage,
		})
	} else if (error instanceof Error) {
		// throw new Error('message')
		console.error('Error:', error)

		return children({
			status: 500,
			statusMessage,
			errorMessage: 'Internal Error',
		})
	}

	console.error('Unknown Error:', error)

	// Unknown error
	return children({
		status: 500,
		statusMessage,
		errorMessage: 'Unknown Error',
	})
}
