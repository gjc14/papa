import { relations } from 'drizzle-orm'
import {
    integer,
    pgTable,
    primaryKey,
    serial,
    varchar,
} from 'drizzle-orm/pg-core'
import { posts } from './posts'

export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
})

export const tagsRelations = relations(tags, ({ many }) => ({
    postsToTags: many(postsToTags),
}))

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
    postsToCategories: many(postsToCategories),
    subCategories: many(subCategories),
}))

export const subCategories = pgTable('sub_categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    categoryId: integer('category_id')
        .notNull()
        .references(() => categories.id, { onDelete: 'cascade' }),
})

export const subCategoriesRelations = relations(subCategories, ({ one }) => ({
    category: one(categories, {
        fields: [subCategories.categoryId],
        references: [categories.id],
    }),
}))

// Associative tables

// posts <-> tags
export const postsToTags = pgTable(
    'posts_to_tags',
    {
        postId: integer('post_id')
            .notNull()
            .references(() => posts.id),
        tagId: integer('tag_id')
            .notNull()
            .references(() => tags.id),
    },
    t => [primaryKey({ columns: [t.postId, t.tagId] })]
)

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
    post: one(posts, {
        fields: [postsToTags.postId],
        references: [posts.id],
    }),
    tag: one(tags, {
        fields: [postsToTags.tagId],
        references: [tags.id],
    }),
}))

// posts <-> categories
export const postsToCategories = pgTable(
    'posts_to_categories',
    {
        postId: integer('post_id')
            .notNull()
            .references(() => posts.id),
        categoryId: integer('category_id')
            .notNull()
            .references(() => categories.id),
    },
    t => [primaryKey({ columns: [t.postId, t.categoryId] })]
)

export const postsToCategoriesRelations = relations(
    postsToCategories,
    ({ one }) => ({
        post: one(posts, {
            fields: [postsToCategories.postId],
            references: [posts.id],
        }),
        category: one(categories, {
            fields: [postsToCategories.categoryId],
            references: [categories.id],
        }),
    })
)
