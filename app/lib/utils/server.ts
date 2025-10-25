import pkg from 'pg'
import { z } from 'zod'

import { capitalize } from '~/lib/utils'

const { DatabaseError } = pkg

/**
 * Handle errors from database operations and return appropriate error responses
 * @param error passing error from catch when try update database with drizzle and zod
 * @param request MDN Request
 * @returns `{ err: string }` error message
 */
export const handleError = (
	error: unknown,
	request?: Request,
	options: { errorMessage?: string } = {},
) => {
	const { errorMessage } = options
	if (error instanceof z.ZodError) {
		console.error('handleError:', error.message)
		return {
			err: 'Internal error: Invalid arguments',
		}
	}
	if (error instanceof DatabaseError) {
		console.error('handleError:', error)
		return {
			err: capitalize(error.message) || error.detail || 'Database error',
		}
	}
	if (error instanceof Error) {
		console.error('handleError:', error.message)
		return {
			err: error.message,
		}
	}
	console.error('handleError:', error)
	return {
		err: errorMessage ?? 'Internal error: Unknown error',
	}
}
