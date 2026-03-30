import { sql, type InferSelectModel } from "drizzle-orm"
import {
	check,
	foreignKey,
	integer,
	serial,
	varchar,
} from "drizzle-orm/pg-core"

import { pgTable } from "~/lib/db/schema/helpers"

export type EcTag = InferSelectModel<typeof ecTag>

export const ecTag = pgTable("ec_tag", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	description: varchar("description", { length: 255 }),
	image: varchar("image"),
})

export type EcCategory = InferSelectModel<typeof ecCategory>

export const ecCategory = pgTable(
	"ec_category",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		description: varchar("description", { length: 255 }),
		parentId: integer("parent_id"),
		image: varchar("image"),
	},
	(table) => [
		// Prevent self-reference: a category cannot be its own parent
		check("no_self_reference", sql`${table.id} != ${table.parentId}`),
		foreignKey({
			name: "parent_category_fk",
			columns: [table.parentId],
			foreignColumns: [table.id],
		}).onDelete("cascade"),
	],
)

export type EcBrand = InferSelectModel<typeof ecBrand>

export const ecBrand = pgTable(
	"ec_brand",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		description: varchar("description", { length: 255 }),
		parentId: integer("parent_id"),
		image: varchar("image"),
	},
	(table) => [
		// Prevent self-reference: a brand cannot be its own parent
		check("no_self_reference", sql`${table.id} != ${table.parentId}`),
		foreignKey({
			name: "parent_brand_fk",
			columns: [table.parentId],
			foreignColumns: [table.id],
		}).onDelete("cascade"),
	],
)

export type EcAttribute = InferSelectModel<typeof ecAttribute>

export const ecAttribute = pgTable("ec_attribute", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	value: varchar("value", { length: 255 }),
})
