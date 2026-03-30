import type { Route } from "./+types/route"
import { data } from "react-router"

import { getProducts } from "../../lib/db/product.server"
import { StorePage } from "./page"

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const url = new URL(request.url)
	const { searchParams } = url
	const categories = searchParams.get("category")?.split(",")
	const tags = searchParams.get("tag")?.split(",")
	const brands = searchParams.get("brand")?.split(",")
	const attributes = searchParams.get("attribute")?.split(",")
	const title = searchParams.get("q") || undefined

	const productsPromise = getProducts({
		categories,
		tags,
		brands,
		attributes,
		title,
	})
	return data({ productsPromise })
}

export default function Store({ loaderData }: Route.ComponentProps) {
	return <StorePage {...loaderData} />
}
