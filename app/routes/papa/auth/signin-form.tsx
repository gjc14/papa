import { useEffect, useState } from 'react'
import { Form, useNavigate } from 'react-router'

import { toast } from '@gjc14/sonner'
import { REGEXP_ONLY_DIGITS } from 'input-otp'

import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '~/components/ui/input-otp'
import { Label } from '~/components/ui/label'
import { Spinner } from '~/components/ui/spinner'
import { authClient } from '~/lib/auth/auth-client'

export const SignInForm = () => {
	const navigate = useNavigate()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [countDown, setCountDown] = useState(0)
	const [showOtpInput, setShowOtpInput] = useState(false)
	const [email, setEmail] = useState('')
	const [otp, setOtp] = useState('')

	const sendDisabled = countDown > 0 || isSubmitting
	const otpLength = 6

	useEffect(() => {
		if (countDown > 0) {
			const timer = setTimeout(() => {
				setCountDown(prev => prev - 1)
			}, 1000)

			return () => clearTimeout(timer)
		}
	}, [countDown])

	const handleSendOTP = async () => {
		if (sendDisabled) return

		if (!email) {
			alert('Please enter a valid email address')
			return
		}

		setIsSubmitting(true)

		await authClient.emailOtp.sendVerificationOtp(
			{
				email: email,
				type: 'sign-in',
			},
			{
				onSuccess: () => {
					setShowOtpInput(true)
					setCountDown(30)
					toast.success('Verification code has sent to your email!')
				},
				onError: ctx => {
					alert('Error sending OTP: ' + ctx.error.message)
					console.error(ctx.error)
				},
			},
		)

		setIsSubmitting(false)
	}

	const handleSignIn = async () => {
		if (isSubmitting) return

		if (!otp || otp.length !== 6) {
			alert('Please enter a valid OTP code')
			return
		}

		setIsSubmitting(true)

		await authClient.signIn.emailOtp(
			{
				email: email,
				otp: otp,
			},
			{
				onSuccess: () => {
					toast.success('Successfully signed in!')
					navigate('/dashboard')
				},
				onError: ctx => {
					alert('Error verifying OTP: ' + ctx.error.message)
					console.error(ctx.error)
				},
			},
		)

		setIsSubmitting(false)
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Sign in</CardTitle>
				<CardDescription>
					{showOtpInput ? (
						<>
							Enter the verification code sent to:
							<br />
							<strong>{email}</strong>
						</>
					) : (
						'Enter your email below to access dashboard.'
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{!showOtpInput ? (
					<Form
						id="send-otp"
						className="grid gap-2"
						onSubmit={e => {
							e.preventDefault()
							handleSendOTP()
						}}
					>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder={
								'email@' +
								(import.meta.env.DEV
									? 'example.com'
									: import.meta.env.VITE_BASE_URL.split('://')[1])
							}
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
						/>
					</Form>
				) : (
					<Form
						id="sign-in"
						className="grid items-center justify-center gap-4"
						onSubmit={e => {
							e.preventDefault()
							handleSignIn()
						}}
					>
						<InputOTP
							id="otp"
							maxLength={otpLength}
							pattern={REGEXP_ONLY_DIGITS}
							value={otp}
							onChange={value => setOtp(value)}
							onComplete={() => {
								handleSignIn()
							}}
						>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>
					</Form>
				)}
			</CardContent>
			<CardFooter className={`${showOtpInput ? 'flex flex-col gap-3' : ''}`}>
				{!showOtpInput ? (
					<Button
						className="w-full"
						disabled={sendDisabled}
						type="submit"
						form="send-otp"
					>
						{isSubmitting ? (
							<Spinner />
						) : countDown > 0 ? (
							<span>Wait {countDown}s to sign in again</span>
						) : (
							'Send Verification Code'
						)}
					</Button>
				) : (
					<>
						<Button
							className="w-full"
							disabled={isSubmitting}
							type="submit"
							form="sign-in"
						>
							{isSubmitting ? <Spinner /> : 'Verify & Sign In'}
						</Button>
						<Button
							variant="outline"
							className="w-full"
							onClick={handleSendOTP}
							disabled={sendDisabled}
						>
							{countDown > 0 ? `Resend in ${countDown}s` : 'Resend Code'}
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	)
}
