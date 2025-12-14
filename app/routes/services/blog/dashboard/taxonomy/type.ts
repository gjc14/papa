import type { PostWithRelations } from '~/lib/db/post.server'
import type { Category, Tag } from '~/lib/db/schema'

export type TagType = Tag & {
	posts: PostWithRelations[]
}

export type CategoryType = Category & {
	children: Category[]
} & { posts: PostWithRelations[] }
