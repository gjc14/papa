import { relations, sql, type InferSelectModel } from 'drizzle-orm'
import {
	check,
	foreignKey,
	index,
	integer,
	primaryKey,
	serial,
	varchar,
} from 'drizzle-orm/pg-core'

import { pgTable } from '~/lib/db/schema/helpers'

import { post } from './post'

export type Tag = InferSelectModel<typeof tag>

export const tag = pgTable('tag', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	slug: varchar('slug', { length: 100 }).notNull().unique(),
	description: varchar('description', { length: 255 }),
})

export type Category = InferSelectModel<typeof category>

export const category = pgTable(
	'category',
	{
		id: serial('id').primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 100 }).notNull().unique(),
		description: varchar('description', { length: 255 }),
		parentId: integer('parent_id'),
	},
	table => [
		// Prevent self-reference: a category cannot be its own parent
		check('no_self_reference', sql`${table.id} != ${table.parentId}`),
		foreignKey({
			name: 'parent_category_fk',
			columns: [table.parentId],
			foreignColumns: [table.id],
		}).onDelete('cascade'),
	],
)

// Associative tables

// posts <-> tags

export type PostToTag = InferSelectModel<typeof postToTag>

export const postToTag = pgTable(
	'post_to_tag',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tag.id, { onDelete: 'cascade' }),
		order: integer('order').notNull().default(0), // Order of the tag in a post
	},
	table => [
		primaryKey({ columns: [table.postId, table.tagId] }), // Composite primary key
		index('post_to_tag_post_id_idx').on(table.postId),
		index('post_to_tag_tag_id_idx').on(table.tagId),
	],
)

// posts <-> categories

export type PostToCategory = InferSelectModel<typeof postToCategory>

export const postToCategory = pgTable(
	'post_to_category',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		categoryId: integer('category_id')
			.notNull()
			.references(() => category.id, { onDelete: 'cascade' }),
		order: integer('order').notNull().default(0), // Order of the category in a post
	},
	table => [
		primaryKey({ columns: [table.postId, table.categoryId] }), // Composite primary key
		index('post_to_category_post_id_idx').on(table.postId),
		index('post_to_category_category_id_idx').on(table.categoryId),
	],
)

// === Relations ===

export const tagRelations = relations(tag, ({ many }) => ({
	postToTag: many(postToTag),
}))

export const categoryRelations = relations(category, ({ one, many }) => ({
	postToCategory: many(postToCategory),
	parent: one(category, {
		fields: [category.parentId],
		references: [category.id],
		relationName: 'parent_child',
	}),
	children: many(category, {
		relationName: 'parent_child',
	}),
}))

export const postToTagRelation = relations(postToTag, ({ one }) => ({
	post: one(post, {
		fields: [postToTag.postId],
		references: [post.id],
	}),
	tag: one(tag, {
		fields: [postToTag.tagId],
		references: [tag.id],
	}),
}))

export const postToCategoryRelations = relations(postToCategory, ({ one }) => ({
	post: one(post, {
		fields: [postToCategory.postId],
		references: [post.id],
	}),
	category: one(category, {
		fields: [postToCategory.categoryId],
		references: [category.id],
	}),
}))
