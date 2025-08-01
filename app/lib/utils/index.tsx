import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export type ActionResponse = {
	msg?: string
	err?: string
	preventNotification?: boolean
} & Record<string, unknown>

export const isActionSuccess = (fetcherData: unknown): boolean => {
	if (fetcherData && typeof fetcherData === 'object' && 'err' in fetcherData) {
		return false
	}
	return true
}

export const capitalize = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export const isValidEmail = (email: string) => {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	return emailRegex.test(email)
}
