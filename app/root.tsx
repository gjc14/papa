import './app.css'

import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router'

import { AlertCircle, ArrowLeft } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'
import { ThemeProvider } from 'next-themes'

import { Button } from '~/components/ui/button'
import { fade } from '~/components/motions'

import {
	ErrorBoundaryTemplate,
	type ErrorBoundaryTemplateProps,
} from './components/error-boundary-template'
import { FloatingToolkit } from './components/floating-toolkit'
import { Toaster } from './components/ui/sonner'

export function links() {
	return [
		{ rel: 'icon', href: '/favicon.ico' },
		// Import Inter and Noto Serif TC from Google Fonts
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Serif+TC:wght@200..900&display=swap',
		},
		{
			rel: 'preconnect',
			href: 'https://fonts.googleapis.com',
		},
		{
			rel: 'preconnect',
			href: 'https://fonts.gstatic.com',
			crossOrigin: 'anonymous',
		},
	]
}

/**
 * @see https://reactrouter.com/api/framework-conventions/root.tsx#layout-export
 * Because your <Layout> component is used for rendering the ErrorBoundary,
 * you should be very defensive to ensure that you can render your ErrorBoundary without encountering any render errors.
 */
export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />

				<title>Papa Open Source CMS</title>
				<meta name="description" content="MIT Open Source Personal CMS." />
				<meta property="og:title" content="Papa Open Source CMS" />
				<meta
					property="og:description"
					content="MIT Open Source Personal CMS."
				/>
				<meta property="og:image" content="/papa-logo-100.png" />
				<Meta />
				<Links />
			</head>
			<body>
				<ThemeProvider>
					<MotionConfig>
						<FloatingToolkit />
						{/* children will be the root Component, ErrorBoundary, or HydrateFallback */}
						{children}
					</MotionConfig>
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return (
		<>
			<Toaster
				position="bottom-right"
				closeButton
				toastOptions={{
					classNames: {
						closeButton: 'border border-primary',
					},
				}}
				className="z-50"
			/>
			<Outlet />
		</>
	)
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
				<title>404 - Page Not Found</title>
				<meta
					name="description"
					content="Sorry, we couldn't find the page you're looking for."
				/>

				<motion.h1
					className="mb-2 text-[8rem] leading-none tracking-tight sm:text-[10rem] md:text-[15rem]"
					{...fade()}
				>
					404
				</motion.h1>

				<h2 className="mb-8 text-2xl font-semibold md:text-3xl">
					Page Not Found
				</h2>

				<p className="text-foreground/80 mx-3 mb-8 max-w-md text-center text-lg">
					Sorry, we couldn't find the page you're looking for.
				</p>

				<Button
					variant={'link'}
					render={
						<Link to={'/'}>
							<ArrowLeft /> Back to Home
						</Link>
					}
				/>
			</main>
		)
	}

	if (status === 500) {
		return (
			<main className="flex h-svh w-screen flex-col items-center justify-center">
				<title>500 - Internal Server Error</title>
				<meta
					name="description"
					content="Something went wrong on our servers."
				/>

				<motion.h1
					className="mb-2 text-[8rem] leading-none tracking-tight sm:text-[10rem] md:text-[15rem]"
					{...fade()}
				>
					500
				</motion.h1>

				<h2 className="mb-8 text-2xl font-semibold md:text-3xl">
					Internal Server Error
				</h2>

				<p className="text-foreground/80 mx-3 mb-8 max-w-md text-center text-lg">
					Something went wrong on our servers.
				</p>

				<div className="flex flex-col gap-4 sm:flex-row">
					<Button
						className="rounded-full"
						render={
							<Link to={'/'}>
								<ArrowLeft className="h-4 w-4" /> Back to Home
							</Link>
						}
					/>
					<Button
						variant="outline"
						className="rounded-full"
						render={
							<a href="mailto:contact@ema.il">
								<AlertCircle />
								Report this error
							</a>
						}
					/>
				</div>
			</main>
		)
	}

	return (
		<main className="flex h-svh w-screen flex-col items-center justify-center">
			<title>
				{status} - {statusMessage.text}
			</title>
			<meta
				name="description"
				content={statusMessage.description || 'Route Error Response'}
			/>

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
				<h2 className="text-muted-foreground mb-8 text-xl font-semibold md:text-3xl">
					{errorMessage}
				</h2>
			)}

			<Button
				variant={'outline'}
				className="rounded-full"
				render={
					<Link to={'/'}>
						<ArrowLeft /> Back to Home
					</Link>
				}
			/>
		</main>
	)
}
