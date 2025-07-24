import type { Route } from './+types/route'
import { Link, useLocation } from 'react-router'

import { ArrowLeft, HeartCrack } from 'lucide-react'

import { Post } from '../components/post'

export default function BlogPost({ matches, params }: Route.ComponentProps) {
	const { posts } = matches[2].data
	const { search } = useLocation()

	const currentPostIndex = posts.findIndex(
		post => post.slug === params.postSlug,
	)
	const currentPost = currentPostIndex !== -1 ? posts[currentPostIndex] : null
	const nextPost =
		currentPostIndex < posts.length - 1 ? posts[currentPostIndex + 1] : null
	const prevPost = currentPostIndex > 0 ? posts[currentPostIndex - 1] : null

	if (!currentPost) {
		return (
			<div className="mx-auto flex flex-1 flex-col items-center justify-center space-y-6">
				<HeartCrack className="size-36" />
				<h1>Post Not found</h1>
			</div>
		)
	}

	return (
		<div className="mx-auto w-full max-w-prose px-3">
			<Link to={'..' + search} className="inline-flex">
				<ArrowLeft className="cursor-pointer" />
			</Link>
			<Post post={currentPost} next={nextPost} prev={prevPost} />
		</div>
	)
}
