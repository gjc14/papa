import { generateText } from '@tiptap/react'

import ExtensionKit from '~/components/editor/extensions/extension-kit'
import type { PostWithRelations } from '~/lib/db/post.server'

const areValuesDiff = (v1: any, v2: any) => {
	if (
		(v1 === null || v1 === undefined || v1 === '') &&
		(v2 === null || v2 === undefined || v2 === '')
	) {
		return false
	}
	return v1 !== v2
}

export const areDifferentPosts = (
	firstPost: PostWithRelations,
	secondPost: PostWithRelations
) => {
	const difference: string[] = []

	const simpleProps = [
		'title',
		'slug',
		'excerpt',
		'featuredImage',
		'status',
	] as const
	simpleProps.forEach(prop => {
		if (areValuesDiff(firstPost[prop], secondPost[prop])) {
			difference.push(prop)
		}
	})

	// author
	const firstPostAuthor = firstPost.author
	const secondPostAuthor = secondPost.author
	if (areValuesDiff(firstPostAuthor?.id, secondPostAuthor?.id)) {
		difference.push('author')
	}

	// JSON.stringify compare
	const complexProps = ['tags', 'categories'] as const
	complexProps.forEach(prop => {
		if (
			areValuesDiff(
				JSON.stringify(firstPost[prop]),
				JSON.stringify(secondPost[prop])
			)
		) {
			difference.push(prop)
		}
	})

	// content compare
	if (firstPost.content !== secondPost.content) {
		try {
			const firstEditorContent = firstPost.content
				? generateText(JSON.parse(firstPost.content), [...ExtensionKit()])
				: ''
			const secondEditorContent = secondPost.content
				? generateText(JSON.parse(secondPost.content), [...ExtensionKit()])
				: ''

			if (areValuesDiff(firstEditorContent, secondEditorContent)) {
				difference.push('content')
			}
		} catch (e) {
			console.error('Error parsing content', e)
			difference.push('content')
		}
	}

	// SEO
	if (
		areValuesDiff(JSON.stringify(firstPost.seo), JSON.stringify(secondPost.seo))
	) {
		const seoProps = [
			'metaTitle',
			'metaDescription',
			'keywords',
			'ogImage',
			'autoGenerated',
			'route',
			'postId',
		] as const

		const [firstSeo, secondSeo] = [firstPost.seo, secondPost.seo]

		seoProps.forEach(prop => {
			if (areValuesDiff(firstSeo?.[prop], secondSeo?.[prop])) {
				difference.push(prop)
			}
		})
	}

	if (difference.length > 0) {
		import.meta.env.DEV && console.log('[DEV] Different posts in:', difference)
		return true
	}

	return false
}
