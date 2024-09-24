import { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
	return [{ title: 'Page not found' }, { name: 'description', content: 'Page not found' }]
}

export default function WhereAreYou() {
	return (
		<main className="w-full h-full min-h-screen flex flex-col items-center justify-center px-3">
			<h1 className="visually-hidden">Page not found</h1>

			<div className="flex flex-col items-center justify-center text-center">
				<img src="/placeholders/7543.svg" alt="Not found" className="mb-4" />
				<h2>Where are you?</h2>
				<p>Sorry, we cannot find the page you're looking for.</p>
			</div>

			<nav className="my-8">
				<Link to="/" aria-label="redirect back to main page">
					<Button>Back to a safe place</Button>
				</Link>
			</nav>
		</main>
	)
}