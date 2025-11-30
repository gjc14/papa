import {
	isRouteErrorResponse,
	Link,
	Outlet,
	type MetaFunction,
} from 'react-router'

import { AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '~/components/ui/button'
import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from '~/components/error-boundary-template'
import { fade } from '~/components/motions'
import { statusCodeMap } from '~/lib/utils/status-code'

export const meta: MetaFunction = ({ error }) => {
	if (!error) {
		return [
			{ title: 'Papa Open Source CMS' },
			{
				name: 'description',
				content: 'This is Website for Papa Open Source CMS',
			},
		]
	}

	if (isRouteErrorResponse(error)) {
		const statusMessage = statusCodeMap[error.status]
		const errorMessage = error.data || statusMessage.text || 'Error Response'
		return [
			{
				title: `${error.status} - ${errorMessage}`,
			},
			{
				name: 'description',
				content: statusMessage?.description || 'Route Error Response',
			},
		]
	} else {
		return [
			{ title: 'Error' },
			{
				name: 'description',
				content: 'An unexpected error occurred.',
			},
		]
	}
}

export default function Web() {
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
	errorMessage,
}: ErrorBoundaryTemplateProps) => {
	if (status === 404) {
		return (
			<main className="flex h-svh w-screen flex-col items-center justify-center">
				<motion.h1
					className="mb-2 text-[8rem] leading-none tracking-tight sm:text-[10rem] md:text-[15rem]"
					{...fade()}
				>
					404
				</motion.h1>

				<h2 className="mb-8 text-2xl font-semibold md:text-3xl">
					Page Not Found
				</h2>

				<p className="text-primary/80 mx-3 mb-8 max-w-md text-center text-lg">
					Sorry, we couldn't find the page you're looking for.
				</p>

				<Link to={'/'}>
					<Button variant={'link'}>
						<ArrowLeft /> Back to Home
					</Button>
				</Link>
			</main>
		)
	}

	if (status === 500) {
		return (
			<main className="flex h-svh w-screen flex-col items-center justify-center">
				<motion.h1
					className="mb-2 text-[8rem] leading-none tracking-tight sm:text-[10rem] md:text-[15rem]"
					{...fade()}
				>
					500
				</motion.h1>

				<h2 className="mb-8 text-2xl font-semibold md:text-3xl">
					Internal Server Error
				</h2>

				<p className="text-primary/80 mx-3 mb-8 max-w-md text-center text-lg">
					Something went wrong on our servers.
				</p>

				<div className="flex flex-col gap-4 sm:flex-row">
					<Link to={'/'}>
						<Button variant="outline" className="rounded-full">
							<ArrowLeft className="h-4 w-4" /> Back to Home
						</Button>
					</Link>

					<a href="mailto:contact@ema.il">
						<Button variant="secondary" className="rounded-full">
							<AlertCircle />
							Report this error
						</Button>
					</a>
				</div>
			</main>
		)
	}

	return (
		<main className="flex h-svh w-screen flex-col items-center justify-center">
			<a
				className="z-10 text-sm underline underline-offset-4"
				href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${status}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				Why am I seeing this error?
			</a>

			<motion.h1
				className="mb-2 text-[8rem] leading-none tracking-tight sm:text-[10rem] md:text-[15rem]"
				{...fade()}
			>
				{status}
			</motion.h1>

			{errorMessage && (
				<h2 className="mb-8 text-2xl font-semibold md:text-3xl">
					{errorMessage}
				</h2>
			)}

			<Link to={'/'}>
				<Button variant={'outline'} className="rounded-full">
					<ArrowLeft /> Back to Home
				</Button>
			</Link>
		</main>
	)
}
