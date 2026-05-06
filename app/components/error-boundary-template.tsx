import { isRouteErrorResponse, useRouteError } from "react-router"
import { statusCodeMap } from "~/lib/utils/status-code"

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

	const internalError = 500
	const internalErrorMessage = statusCodeMap[internalError]

	if (isRouteErrorResponse(error)) {
		// Route throw new Response (404, etc.)
		const statusMessage = statusCodeMap[error.status]

		console.error("Route Error Response:", error)

		return children({
			status: error.status,
			statusMessage: {
				text: error.statusText || statusMessage.text,
				description: statusMessage.description,
			},
			errorMessage: error.data || "Route Error Response",
		})
	} else if (error instanceof Error) {
		// throw new Error('message')
		console.error(error)

		return children({
			status: internalError,
			statusMessage: internalErrorMessage,
			errorMessage: error.message,
		})
	}

	console.error("Unknown Error:", error)

	// Unknown error
	return children({
		status: internalError,
		statusMessage: internalErrorMessage,
		errorMessage: "Unknown Error",
	})
}
