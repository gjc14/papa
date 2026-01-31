import { useEffect, useMemo } from 'react'
import {
	Form,
	Link,
	useFetcher,
	useLocation,
	useNavigate,
	useNavigation,
	useSubmit,
} from 'react-router'

import debounce from 'lodash/debounce'
import { CircleCheckIcon, XCircle } from 'lucide-react'
import { motion } from 'motion/react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { InputSearch } from '~/components/ui/input-search'

import type { PostWithRelations } from '../..//lib/db/post.server'

export const PostCollection = ({
	title,
	posts,
	description,
	q,
}: {
	title: string
	posts: PostWithRelations[]
	description?: React.ReactNode
	q?: string
}) => {
	return (
		<div className="mx-auto mt-6 mb-20 flex w-full max-w-2xl flex-col gap-8 px-3 md:px-9">
			<div className="flex flex-col px-6">
				<motion.h2
					initial={{ y: 48, opacity: 0 }}
					whileInView={{ y: 0, opacity: 1 }}
					transition={{ ease: 'easeInOut', duration: 0.5 }}
					className="text-8xl font-black md:text-9xl"
				>
					{title}
				</motion.h2>
				{description ? (
					<div className="relative mt-12 rounded-md border bg-emerald-500/30 px-4 py-3">
						<div className="flex gap-3">
							<CircleCheckIcon
								className="mt-0.5 shrink-0 opacity-70"
								size={16}
								aria-hidden="true"
							/>
							<div className="grow space-y-1">
								<p className="text-sm font-medium">
									Post Collection Filter By:
								</p>
								<ul className="text-muted-foreground flex list-inside list-disc flex-col gap-1 text-sm">
									{description}
								</ul>
							</div>
						</div>
						<Link to="/blog">
							<XCircle
								className="absolute top-1 right-1 cursor-pointer opacity-60 hover:opacity-100"
								size={16}
								aria-hidden="true"
							/>
						</Link>
					</div>
				) : (
					<div className="my-5" />
				)}
			</div>

			<Search q={q} />

			<section className="flex flex-col space-y-3">
				{posts.map(post => (
					<Post key={post.id} post={post} />
				))}
			</section>
		</div>
	)
}

const Post = ({ post }: { post: PostWithRelations }) => {
	const fetcher = useFetcher()
	const navigate = useNavigate()
	const { search } = useLocation()
	const url = `/blog/${post.slug}${search}`

	return (
		<div
			onClick={() => navigate(url)}
			onMouseEnter={() => fetcher.load(url)}
			className="group hover:bg-accent cursor-pointer py-4 md:py-5"
		>
			<div className="flex flex-col px-4 md:px-6">
				<div className="mb-3 flex gap-1.5">
					{post.categories.map(category => (
						<Badge
							key={category.id}
							className="bg-brand text-brand-foreground hover:border-primary rounded-full"
							onClick={e => {
								e.stopPropagation()
								navigate(`/blog?category=${category.slug}`)
							}}
							onMouseEnter={() =>
								fetcher.load(`/blog?category=${category.slug}&index`)
							}
						>
							{category.name}
						</Badge>
					))}
				</div>

				<h2 className="text-xl underline-offset-4 group-hover:underline md:text-2xl">
					{post.title}
				</h2>

				<p className="text-muted-foreground mt-3 text-sm">{post.excerpt}</p>

				<div className="mt-8 flex items-center justify-start gap-3.5">
					<Avatar className="size-8">
						<AvatarImage
							src={post.author?.image ?? undefined}
							alt={post.author?.name ?? 'A'}
						/>
						<AvatarFallback>{post.author?.name?.[0] ?? 'A'}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="text-sm font-semibold">
							{post.author?.name ?? 'Anonymous'}
						</span>
						<span className="text-muted-foreground text-xs">
							{post.updatedAt.toLocaleDateString('zh-TW')}
						</span>
					</div>
				</div>
			</div>
		</div>
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
			className="relative px-5 md:px-6"
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
