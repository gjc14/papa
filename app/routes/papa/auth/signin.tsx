import { redirect, type LoaderFunctionArgs } from 'react-router'

import { MainWrapper } from '~/components/wrappers'
import { auth } from '~/lib/auth/auth.server'

import { SignInForm } from './signin-form'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await auth.api.getSession(request)

	if (session) {
		return redirect('/admin')
	}
	return null
}

export default function AdminAuth() {
	return (
		<MainWrapper className="justify-center">
			<SignInForm />
		</MainWrapper>
	)
}
