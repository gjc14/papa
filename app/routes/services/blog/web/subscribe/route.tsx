import { redirect, type ActionFunctionArgs } from 'react-router'

import { z } from 'zod'

import { TurnstileSiteVerify } from '~/components/captchas/turnstile'
import { auth } from '~/lib/auth/auth.server'
import { isValidEmail, type ActionResponse } from '~/lib/utils'

const captchaSchema = z.enum(['turnstile', 'recaptcha', 'hcaptcha'])

export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method !== 'POST') {
		return {
			err: 'Method not allowed',
		} satisfies ActionResponse
	}

	const formData = await request.formData()

	// Verify
	const captcha = formData.get('captcha')
	const zCaptchaResult = captchaSchema.safeParse(captcha)

	if (!zCaptchaResult.success) {
		return {
			err: 'Invalid arguments, missing captcha',
		} satisfies ActionResponse
	}

	switch (zCaptchaResult.data) {
		case 'turnstile': {
			const turnstileResponse = formData.get('cf-turnstile-response')

			const zTurnstileResult = z.string().safeParse(turnstileResponse)
			if (!zTurnstileResult.success) {
				return {
					err: 'Invalid arguments',
				} satisfies ActionResponse
			}

			const passed = await TurnstileSiteVerify(
				zTurnstileResult.data,
				process.env.TURNSTILE_SECRET_KEY ?? '',
			)
			if (!passed) {
				return {
					err: 'CAPTCHA Failed! Please try again',
				} satisfies ActionResponse
			}
			break
		}
		case 'recaptcha': {
			return {
				err: 'Recaptcha not implemented',
			} satisfies ActionResponse
		}
		case 'hcaptcha': {
			return {
				err: 'Hcaptcha not implemented',
			} satisfies ActionResponse
		}
	}

	// Create
	const email = formData.get('email')
	if (typeof email !== 'string' || !isValidEmail(email)) {
		return {
			err: 'Invalid arguments',
		} satisfies ActionResponse
	}

	try {
		const { user } = await auth.api.createUser({
			body: {
				email,
				password: '',
				name: '',
				role: 'user',
			},
		})

		return {
			msg: `Welcom! Subscribed with ${user.email}!`,
		} satisfies ActionResponse
	} catch (error) {
		// TODO: Handle user existing error
		console.error('Error creating user:', error)
		return {
			err: 'Failed to subscribe',
		} satisfies ActionResponse
	}
}

export const loader = () => {
	return redirect('/blog', { status: 308 })
}
