/**
 * This is a post display component for a blog post.
 * It make the page layout, including the title, meta information, and content.
 */
import 'highlight.js/styles/base16/framer.min.css'

import { useEffect, useState } from 'react'

import { generateHTML } from '@tiptap/html'
import hljs from 'highlight.js'

import { Spinner } from '~/components/ui/spinner'
import { ExtensionKit } from '~/components/editor/extension-kit'
import { useHydrated } from '~/hooks/use-hydrated'

import type { PostWithRelations } from '../../../lib/db/post.server'
import { PostFooter } from './post-footer'
import { PostMeta } from './post-meta'

export const Post = ({
	post,
	editable = false,
	onTitleChange,
	children,
	prev,
	next,
}: {
	post: PostWithRelations
	editable?: boolean
	onTitleChange?: (title: string) => void
	children?: React.ReactNode
	prev?: { title: string; slug: string } | null
	next?: { title: string; slug: string } | null
}) => {
	const isHydrated = useHydrated()
	const [html, setHtml] = useState<string | null>(null)
	const [placeholder, setPlaceholder] = useState<string>()

	useEffect(() => {
		const prepareHtml = async () => {
			if (!post.content || !isHydrated) return

			let generatedHtml = generateHTML(JSON.parse(post.content), [
				...ExtensionKit({ openOnClick: true }),
			])

			const tempDiv = document.createElement('div')
			tempDiv.innerHTML = generatedHtml

			const codeBlocks = tempDiv.querySelectorAll('pre code')
			codeBlocks.forEach(block => {
				hljs.highlightElement(block as HTMLElement)
				block.classList.remove('hljs') // Remove the default hljs class to remove background-color
			})

			setHtml(tempDiv.innerHTML)
		}

		prepareHtml()

		setPlaceholder(getRandomTitlePlaceholder())
	}, [isHydrated])

	return (
		<>
			<div className="space-y-5">
				{editable ? (
					<textarea
						id="title"
						name="title"
						placeholder={placeholder}
						value={post.title}
						onChange={e => onTitleChange?.(e.target.value)}
						className="block field-sizing-content min-h-0 w-full resize-none border-none bg-transparent text-3xl leading-normal font-bold tracking-tight outline-none md:text-4xl md:leading-tight"
					/>
				) : (
					<h1 className="text-3xl leading-normal font-bold tracking-tight md:text-4xl md:leading-tight">
						{post.title}
					</h1>
				)}

				<PostMeta post={post} />
			</div>

			{editable ? (
				children
			) : html ? (
				<article
					className="prose-article"
					dangerouslySetInnerHTML={{
						__html: html,
					}}
				/>
			) : (
				<Spinner className="mx-auto my-28" />
			)}

			<PostFooter post={post} next={next} prev={prev} />
		</>
	)
}

function getRandomTitlePlaceholder() {
	const titles = [
		'This Cuisine is...',
		'Future of Finance...',
		'New Innovation in...',
		'Next Month We Expect...',
		'My Journey...',
		'Personal Growth...',
		'New Bug Found...',
		'How to Turn on the Light...',
		'Next Typhoon Comes in...',
		'Doraemon is AI...',
	]
	const randomIndex = Math.floor(Math.random() * titles.length)
	return titles[randomIndex]
}
