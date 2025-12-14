import { useEffect, useState } from 'react'
import { Outlet, useNavigation } from 'react-router'

import { BlogLoading } from './components/blog-loading'
import { CTA } from './components/cta'
import { Footer } from './components/footer'
import { Nav } from './components/nav'

export default function Blog() {
	const navigation = useNavigation()
	const isLoading = navigation.state === 'loading'

	const [showLoading, setShowLoading] = useState(false)

	useEffect(() => {
		let timeoutId: NodeJS.Timeout

		if (isLoading) {
			timeoutId = setTimeout(() => {
				setShowLoading(true)
			}, 80)
		} else {
			setShowLoading(false)
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
		}
	}, [isLoading])

	return (
		<div className="relative">
			<main className="relative flex min-h-svh w-full flex-1 flex-col">
				<Nav />
				<Outlet />
				<CTA />
				<Footer />
			</main>

			{isLoading && showLoading && (
				<>
					<div className="fixed inset-0 z-10 bg-white/50 dark:bg-black/50" />
					<BlogLoading />
				</>
			)}
		</div>
	)
}
