import assert from 'node:assert/strict'
import { type ActionFunctionArgs } from 'react-router'

import { createUpdateSchema } from 'drizzle-zod'

import { auth } from '~/lib/auth/auth.server'
import { user } from '~/lib/db/schema'
import { deleteUser, updateUser } from '~/lib/db/user.server'
import { isValidEmail, type ActionResponse } from '~/lib/utils'
import { handleError } from '~/lib/utils/server'

import { validateAdminSession } from '../../auth/utils'

const userUpdateSchema = createUpdateSchema(user).omit({
	id: true, // id will be checked separately, may be a string or comma-separated string of IDs
	createdAt: true,
	updatedAt: true,
	banExpires: true,
})

/**
 * Please pass in id as a string or comma-separated string of IDs.
 * You could directly pass an array of IDs to submit / fetcher, react router will convert it to a string.
 * ```ts
 * import { useFetcher } from 'react-router'
 *
 * const fetcher = useFetcher()
 * fetcher.submit({
 *   id: ['1', '2', '3'], // or '1,2,3' or '1' if you want to delete a single user
 * }, {
 *   method: 'POST',
 *   action: '/papa/dashboard/users/resource',
 * })
 * ```
 * @returns
 */
export const action = async ({ request }: ActionFunctionArgs) => {
	if (!['POST', 'PUT', 'DELETE'].includes(request.method)) {
		return {
			err: 'Method not allowed',
		} satisfies ActionResponse
	}

	const adminSession = await validateAdminSession(request)

	const formData = await request.formData()
	const userData: Record<string, string | boolean | File> = {}

	for (const [key, value] of formData.entries()) {
		if (['emailVerified', 'banned'].includes(key)) {
			userData[key] = value === 'true'
		} else {
			userData[key] = value
		}
	}

	switch (request.method) {
		case 'POST':
			try {
				const email = userData.email
				const name = userData.name
				const role = userData.role

				assert(
					typeof name === 'string' &&
						typeof email === 'string' &&
						(role === 'admin' || role === 'user'),
					'Invalid arguments',
				)

				assert(isValidEmail(email), 'Invalid email')

				const { user } = await auth.api.createUser({
					body: {
						email,
						name,
						password: '',
						role,
					},
				})

				await auth.api.sendVerificationEmail({
					body: {
						email: user.email,
						callbackURL: role === 'admin' ? '/dashboard' : '/',
					},
				})

				return {
					msg: `${role} ${user.email} has created successfully`,
				} satisfies ActionResponse
			} catch (error) {
				return handleError(error, request)
			}
		case 'PUT':
			try {
				let user = userUpdateSchema.parse(userData)
				const userIds = userData.id

				console.log('userData', userData)

				assert(
					typeof userIds === 'string' && userIds.split(',').length > 0,
					'Invalid user ID',
				)
				const userIdArray = userIds.split(',')

				const { user: userUpdated } = await updateUser({
					id: userIdArray,
					data: {
						email: user.email,
						emailVerified: user.emailVerified,
						name: user.name,
						image: user.image,
						role: user.role,
						banReason: user.banReason,
						banned: user.banned,
					},
				})

				assert(userUpdated.length > 0, 'User not found')

				const userNames = userUpdated
					.map(u => u.name || u.email || u.id)
					.join(', ')

				return {
					msg: `${userNames} updated successfully`,
				} satisfies ActionResponse
			} catch (error) {
				return handleError(error, request)
			}
		case 'DELETE':
			try {
				const userIds = userData.id

				assert(
					typeof userIds === 'string' && userIds.split(',').length > 0,
					'Invalid user ID',
				)
				const userIdArray = userIds.split(',')

				assert(
					!userIdArray.includes(adminSession.user.id),
					'You cannot delete yourself! 😠',
				)

				const { user } = await deleteUser(userIdArray)

				assert(user.length > 0, 'User not found')

				const userNames = user.map(u => u.name || u.email || u.id).join(', ')

				return {
					msg: `${userNames} deleted successfully`,
				} satisfies ActionResponse
			} catch (error) {
				return handleError(error, request)
			}
	}
}
