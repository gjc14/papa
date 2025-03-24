import { relations } from 'drizzle-orm'
import {
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'
import { seos } from './seos'
import { postsToCategories, postsToTags } from './taxonomies'
import { users } from './users'

export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    slug: varchar('slug').notNull().unique(),
    title: varchar('title').notNull(),
    content: text('content'),
    excerpt: varchar('excerpt'),
    featuredImage: varchar('featured_image'),
    status: varchar('status', { length: 50 }).notNull(),

    authorId: integer('author_id').references(() => users.id, {
        onDelete: 'set null',
    }),
})

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, { fields: [posts.authorId], references: [users.id] }),
    seo: one(seos),

    postsToTags: many(postsToTags),
    postsToCategories: many(postsToCategories),
}))
