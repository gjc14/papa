import { useRouteError, useRouteLoaderData } from "react-router"

export const useNonce = () => {
	const loaderData: unknown = useRouteLoaderData("root")
	const error = useRouteError()

	const nonce =
		!error &&
		loaderData &&
		typeof loaderData === "object" &&
		"nonce" in loaderData &&
		typeof loaderData.nonce === "string"
			? loaderData.nonce
			: undefined

	return nonce
}
