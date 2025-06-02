import pkg from 'pg'
import { z } from 'zod'

import { capitalize, type ConventionalActionResponse } from '~/lib/utils'

const { DatabaseError } = pkg

/**
 * Handle errors from database operations and return appropriate error responses
 * @param error passing error from catch when try update database with drizzle and zod
 * @param request MDN Request
 * @returns `{ err: string }` error message
 */
export const handleError = <T>(
	error: unknown,
	request: Request,
	options: { errorMessage?: string } = {},
): ConventionalActionResponse<T> => {
	const { errorMessage } = options
	if (error instanceof z.ZodError) {
		console.error(error.message)
		return {
			err: 'Internal error: Invalid argument',
		} satisfies ConventionalActionResponse
	}

	if (error instanceof DatabaseError) {
		console.error(error)
		return {
			err: capitalize(error.message) || error.detail || 'Database error',
		} satisfies ConventionalActionResponse
	}

	if (error instanceof Error) {
		console.error(error.message)
		return {
			err: error.message,
		} satisfies ConventionalActionResponse
	}

	console.error(error)
	return {
		err: errorMessage ?? 'Internal error: Unknown error',
	} satisfies ConventionalActionResponse
}
