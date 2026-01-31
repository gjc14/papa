import { Suspense, useEffect, useMemo } from 'react'
import { Await, Form, useNavigation, useSubmit } from 'react-router'

import debounce from 'lodash/debounce'

import { InputSearch } from '~/components/ui/xui/input-search'

import type { ProductListing } from '../../lib/db/product.server'
import {
	ProductCard,
	ProductCardSkeleton,
} from '../product/components/product-card'

type StorePageProps = {
	productsPromise: Promise<ProductListing[]>
}

export function StorePage(props: StorePageProps) {
	const { productsPromise } = props

	return (
		<main className="container m-2 flex flex-1 flex-col gap-5 p-2 md:m-5">
			<h1>Store</h1>

			<Search />

			<div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
				<Suspense
					fallback={
						<>
							{Array.from({ length: 8 }).map((_, index) => (
								<ProductCardSkeleton key={index} />
							))}
						</>
					}
				>
					<Await resolve={productsPromise}>
						{products =>
							products.map(product => (
								<ProductCard key={product.id} product={product} />
							))
						}
					</Await>
				</Suspense>
			</div>
		</main>
	)
}

const Search = ({ q }: { q?: string }) => {
	const submit = useSubmit()
	const navigation = useNavigation()

	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has('q')

	// Sync search input with URL param
	useEffect(() => {
		const searchField = document.getElementById('q')
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || ''
		}
	}, [q])

	const debouncedSearch = useMemo(
		() =>
			debounce((form: HTMLFormElement) => {
				submit(form)
			}, 600),
		[submit],
	)

	useEffect(() => {
		return () => {
			debouncedSearch.cancel()
		}
	}, [debouncedSearch])

	return (
		<Form
			id="search-form"
			role="search"
			onChange={event => {
				debouncedSearch(event.currentTarget)
			}}
			className="relative"
		>
			<InputSearch
				isLoading={searching}
				aria-label="Search posts"
				defaultValue={q || ''}
				id="q"
				name="q"
			/>
		</Form>
	)
}
