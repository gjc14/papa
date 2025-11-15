import { useEffect, useState } from 'react'
import { Form, useNavigate } from 'react-router'

import { toast } from '@gjc14/sonner'
import { REGEXP_ONLY_DIGITS } from 'input-otp'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
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

export const SignInForm = ({
	user,
}: {
	user?: {
		email: string
		name: string
		image?: string | null
		role?: string | null
	}
}) => {
	const navigate = useNavigate()

	const [isSigningIn, setIsSigningIn] = useState(false)
	const [isSendingOtp, setIsSendingOtp] = useState(false)
	const [countDown, setCountDown] = useState(0)
	const [showOtpInput, setShowOtpInput] = useState(false)
	const [email, setEmail] = useState('')
	const [otp, setOtp] = useState('')

	const sendDisabled = countDown > 0 || isSigningIn || isSendingOtp
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

		setIsSendingOtp(true)

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

		setIsSendingOtp(false)
	}

	const handleSignIn = async () => {
		if (isSigningIn || isSendingOtp) return

		if (!otp || otp.length !== 6) {
			alert('Please enter a valid OTP code')
			return
		}

		setIsSigningIn(true)

		const { error } = await authClient.signIn.emailOtp(
			{ email, otp },
			{ onSuccess: () => navigate('/dashboard') },
		)

		if (error) {
			alert('Error verifying OTP: ' + error.message)
			console.error(error)
		}

		setIsSigningIn(false)
	}

	const handleSignOut = async () => {
		await authClient.signOut()
		navigate(0)
	}

	if (user) {
		return (
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Welcome back</CardTitle>
					<CardDescription>You are already signed in</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center gap-3">
					<Avatar className="size-28">
						<AvatarImage
							src={user.image ?? '/placeholders/avatar.png'}
							alt={user.name || 'User'}
						/>
						<AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col items-center gap-1">
						<p className="text-lg font-semibold">{user.name || user.email}</p>
						<p className="text-muted-foreground text-sm">{user.email}</p>
						{user.role && (
							<p className="text-primary text-xs font-medium capitalize">
								{user.role}
							</p>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<Button className="w-full" onClick={handleSignOut}>
						Sign Out
					</Button>
				</CardFooter>
			</Card>
		)
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
						className="my-2 grid gap-2"
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
						className="my-3 grid items-center justify-center gap-4"
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
								<InputOTPSlot index={0} className="size-12" />
								<InputOTPSlot index={1} className="size-12" />
								<InputOTPSlot index={2} className="size-12" />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={3} className="size-12" />
								<InputOTPSlot index={4} className="size-12" />
								<InputOTPSlot index={5} className="size-12" />
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
						{isSendingOtp ? (
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
							disabled={isSigningIn || isSendingOtp}
							type="submit"
							form="sign-in"
						>
							{isSigningIn ? <Spinner /> : 'Verify & Sign In'}
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
