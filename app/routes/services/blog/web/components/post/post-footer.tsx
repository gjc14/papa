import { Link, useLocation, useNavigate } from 'react-router'

import { ChevronLeftIcon } from '@radix-ui/react-icons'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

import type { PostWithRelations } from '../../../lib/db/post.server'

export const PostFooter = ({
	post,
	prev,
	next,
}: {
	post: PostWithRelations
	prev?: { title: string; slug: string } | null
	next?: { title: string; slug: string } | null
}) => {
	const navigate = useNavigate()
	const { search } = useLocation()

	return (
		<footer className="py-9 md:py-12">
			{/* Tags area */}
			{post.tags.length > 0 && (
				<ul className="my-8 flex flex-wrap items-center gap-1.5 md:my-12 md:gap-2">
					{post.tags.map(tag => (
						<li key={tag.id}>
							<Badge
								className="cursor-pointer rounded-full px-2.5 py-1 md:text-sm"
								onClick={() => navigate(`/blog?tag=${tag.slug}`)}
							>
								{tag.name}
							</Badge>
						</li>
					))}
				</ul>
			)}
			<Separator />

			{/* Navigation area */}
			<div className="my-8 grid grid-cols-2 gap-4">
				{prev ? (
					<Button
						variant="ghost"
						className="group hover:bg-muted/50 flex h-auto items-center justify-start gap-3 p-4 text-left transition-colors"
						asChild
					>
						<Link to={`/blog/${prev.slug}${search}`} prefetch="intent">
							<ChevronLeftIcon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
							<div className="min-w-0 flex-1">
								<div className="text-muted-foreground mb-1 text-xs">
									Previous
								</div>
								<p className="line-clamp-2 font-medium text-wrap">
									{prev.title}
								</p>
							</div>
						</Link>
					</Button>
				) : (
					<div />
				)}

				{next ? (
					<Button
						variant="ghost"
						className="group hover:bg-muted/50 flex h-auto items-center justify-end gap-3 p-4 text-right whitespace-break-spaces transition-colors"
						asChild
					>
						<Link to={`/blog/${next.slug}${search}`} prefetch="intent">
							<div className="min-w-0 flex-1 overflow-visible">
								<div className="text-muted-foreground mb-1 text-xs">Next</div>
								<p className="line-clamp-2 font-medium text-wrap">
									{next.title}
								</p>
							</div>
							<ChevronLeftIcon className="h-4 w-4 flex-shrink-0 rotate-180 transition-transform group-hover:translate-x-1" />
						</Link>
					</Button>
				) : (
					<div />
				)}
			</div>
		</footer>
	)
}
