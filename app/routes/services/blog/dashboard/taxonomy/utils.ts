import { useFetchers } from 'react-router'

import type { CategoryType, TagType } from './type'

type pendingItem = ReturnType<typeof useFetchers>[number] & {
	formData: FormData
}

/**
 * Optimistic add with useSubmit/useFetchers
 * @see https://www.youtube.com/watch?v=-0Qi0yMyLwQ
 */
const usePendingCategories = () => {
	return useFetchers()
		.filter((fetcher): fetcher is pendingItem => {
			if (!fetcher.formData) return false
			const gotchaTag = fetcher.formData.get('intent') === 'category'
			const isPOST = fetcher.formMethod === 'POST'
			return gotchaTag && isPOST
		})
		.map(fetcher => {
			return {
				id: Number(fetcher.formData?.get('id')),
				parentId: null,
				name: fetcher.formData?.get('name'),
				slug: fetcher.formData?.get('slug'),
				description: fetcher.formData?.get('description'),
				children: [],
				posts: [],
			} as CategoryType
		})
}

/**
 * Optimistic add with useSubmit/useFetchers
 * @see https://www.youtube.com/watch?v=-0Qi0yMyLwQ
 */
const usePendingChildCategories = () => {
	return useFetchers()
		.filter((fetcher): fetcher is pendingItem => {
			if (!fetcher.formData) return false
			const gotchaChildCategory =
				fetcher.formData.get('intent') === 'child-category'
			const isPOST = fetcher.formMethod === 'POST'
			return gotchaChildCategory && isPOST
		})
		.map(fetcher => {
			return {
				id: Number(fetcher.formData?.get('id')),
				name: fetcher.formData?.get('name'),
				parentId: Number(fetcher.formData?.get('parentId')),
				slug: fetcher.formData?.get('slug'),
				description: fetcher.formData?.get('description'),
			} as CategoryType
		})
}

/**
 * Optimistic add with useSubmit/useFetchers
 * @see https://www.youtube.com/watch?v=-0Qi0yMyLwQ
 */
const usePendingTags = () => {
	return useFetchers()
		.filter((fetcher): fetcher is pendingItem => {
			if (!fetcher.formData) return false
			const gotchaTag = fetcher.formData.get('intent') === 'tag'
			const isPOST = fetcher.formMethod === 'POST'
			return gotchaTag && isPOST
		})
		.map(fetcher => {
			return {
				id: Number(fetcher.formData.get('id')),
				name: String(fetcher.formData.get('name')),
				slug: String(fetcher.formData.get('slug')),
				description: String(fetcher.formData.get('description') || ''),
				posts: [],
			} as TagType
		})
}

export { usePendingCategories, usePendingChildCategories, usePendingTags }
