import { useEffect, useRef } from "react"

interface Turnstile {
	render: (element: HTMLElement, options: { sitekey: string }) => void
}

declare global {
	interface Window {
		turnstile?: Turnstile
	}
}

export const TurnstileWidget = () => {
	const widgetRef = useRef(null)
	const initializedRef = useRef(false)

	useEffect(() => {
		if (initializedRef.current) return
		initializedRef.current = true

		const scriptId = "cf-turnstile-script"
		const existingScript = document.getElementById(scriptId)

		if (!existingScript) {
			const script = document.createElement("script")
			script.src =
				"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			script.async = true
			script.defer = true
			script.id = scriptId
			document.body.appendChild(script)
			script.onload = () => {
				if (widgetRef.current) {
					window.turnstile?.render(widgetRef.current, {
						sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
					})
				}
			}
		} else {
			if (widgetRef.current) {
				window.turnstile?.render(widgetRef.current, {
					sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
				})
			}
		}
	}, [])

	return <div ref={widgetRef}></div>
}

export const TurnstileSiteVerify = async (
	turnstileResponse: string,
	TURNSTILE_SECRET_KEY: string,
): Promise<boolean> => {
	const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
	const data = new URLSearchParams()
	data.append("secret", TURNSTILE_SECRET_KEY)
	data.append("response", turnstileResponse)

	const res = await fetch(url, {
		method: "POST",
		body: data,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	})
	if (!res.ok) {
		console.error("Network response was not ok", res.status, res.statusText)
		return false
	}

	const result = await res.json()
	if (!result.success) {
		console.error("Turnstile verification failed", result)
		return false
	}
	return true
}
