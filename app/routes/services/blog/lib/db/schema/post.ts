import { relations, sql, type InferSelectModel } from 'drizzle-orm'
import { check, integer, serial, text, varchar } from 'drizzle-orm/pg-core'

import { user } from '~/lib/db/schema/auth'
import { pgTable, timestampAttributes } from '~/lib/db/schema/helpers'
import { seo } from '~/lib/db/schema/seo'

import { postToCategory, postToTag } from './taxonomy'

export const PostStatus = [
	'DRAFT',
	'SCHEDULED',
	'PUBLISHED',
	'ARCHIVED',
	'TRASHED',
	'OTHER',
] as const
export type PostStatus = (typeof PostStatus)[number]

export type Post = InferSelectModel<typeof post>

export const post = pgTable(
	'post',
	{
		id: serial('id').primaryKey(),
		status: varchar('status', { length: 20 }).notNull(),
		slug: varchar('slug').notNull().unique(),
		title: varchar('title').notNull(),
		content: text('content'),
		excerpt: varchar('excerpt'),
		featuredImage: varchar('featured_image'),

		authorId: text('author_id').references(() => user.id, {
			onDelete: 'set null',
		}),

		seoId: integer('seo_id')
			.references(() => seo.id, {
				onDelete: 'restrict',
			})
			.notNull(),

		...timestampAttributes,
	},
	t => [check('prevent_system_slug', sql`${t.slug} != 'new'`)],
)

export const postRelations = relations(post, ({ one, many }) => ({
	author: one(user, {
		fields: [post.authorId],
		references: [user.id],
	}),
	seo: one(seo, {
		fields: [post.seoId],
		references: [seo.id],
	}),

	postToTag: many(postToTag),
	postToCategory: many(postToCategory),
}))
