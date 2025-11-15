import type { Route } from './+types/portal'
import { useEffect } from 'react'
import { redirect } from 'react-router'

import { toast } from '@gjc14/sonner'

import { MainWrapper } from '~/components/wrappers'
import { auth } from '~/lib/auth/auth.server'

import { SignInForm } from './signin-form'

export const loader = async ({ request }: Route.LoaderArgs) => {
	const session = await auth.api.getSession(request)

	if (session && session.user.role === 'admin') {
		return redirect('/dashboard')
	}
	return { session }
}

export default function DashboardPortal({ loaderData }: Route.ComponentProps) {
	useEffect(() => {
		if (loaderData.session && loaderData.session.user.role !== 'admin')
			toast.error('Unauthorized')
	}, [loaderData.session])

	return (
		<MainWrapper className="justify-center">
			<SignInForm user={loaderData.session?.user} />
		</MainWrapper>
	)
}
