import { useEffect, useMemo } from 'react'
import { Form, useSubmit } from 'react-router'

import debounce from 'lodash/debounce'

import { InputSearch } from '~/components/ui/input-search'

export const Search = ({
	q,
	searching,
}: {
	q?: string
	searching?: boolean
}) => {
	const submit = useSubmit()

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
