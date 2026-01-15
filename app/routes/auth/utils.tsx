import { redirect } from 'react-router'

import { auth } from '~/lib/auth/auth.server'

export async function validateAdminSession(
	request: Request,
): Promise<NonNullable<typeof session>> {
	const session = await auth.api.getSession(request)
	if (!session || session.user.role !== 'admin') {
		throw redirect('/dashboard/portal')
	}
	return session
}
