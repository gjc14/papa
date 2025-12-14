import { useFetcher } from 'react-router'

import { Button } from '~/components/ui/button'
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Spinner } from '~/components/ui/spinner'

export const CTA = ({
	subscribeRoute = '/blog/subscribe',
}: {
	subscribeRoute?: string
}) => {
	return null

	// TODO: Implement CSRF protection
	const fetcher = useFetcher()
	const isSubmitting = fetcher.formAction === subscribeRoute

	return (
		<section className="my-12 flex max-w-3xl flex-col py-20 md:px-12 lg:px-18">
			<div className="mx-1 border px-3 py-2 sm:px-8 sm:py-6">
				<CardHeader>
					<CardTitle>Subscribe to new posts!</CardTitle>
					<CardDescription>
						If you like topics like{' '}
						<span>Tech, Software Development, or Travel</span>. Welcome to
						subscribe for free to get some fresh ideas!
					</CardDescription>
				</CardHeader>
				<CardContent>
					<fetcher.Form
						className="flex w-full items-center gap-3"
						method="POST"
						action={subscribeRoute}
					>
						<Input placeholder="your@ema.il" name="email" />
						<Button size={'sm'}>
							<Spinner
								className={`absolute ${
									isSubmitting ? 'opacity-100' : 'opacity-0'
								}`}
							/>
							<span className={`${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
								Subscribe
							</span>
						</Button>

						{/* Chose your CAPTCHA */}
						{/* <input type="hidden" name="captcha" value="turnstile" /> */}
						{/* <TurnstileWidget /> */}
					</fetcher.Form>
				</CardContent>
			</div>
		</section>
	)
}
