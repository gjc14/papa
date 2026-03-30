import { relations, type InferSelectModel } from "drizzle-orm"
import { index, integer, text, uuid, varchar } from "drizzle-orm/pg-core"

import { user } from "./auth"
import { deletedAtAttribute, pgTable, timestampAttributes } from "./helpers"

export type FileMetadata = InferSelectModel<typeof file>

export const file = pgTable(
	"file",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		key: varchar("key", { length: 255 }).unique().notNull(),
		type: varchar("type", { length: 100 }).notNull(),
		size: integer("size").notNull(),
		name: varchar("name", { length: 255 }).notNull(),
		description: varchar("description", { length: 255 }),
		star: integer("star").default(0),

		ownerId: text("owner_id").references(() => user.id, {
			onDelete: "set null",
		}),
		public: integer("public").default(0),

		...timestampAttributes,
		...deletedAtAttribute,
	},
	(t) => [
		index("file_owner_id_idx").on(t.ownerId),
		index("file_key_idx").on(t.key),
	],
)

export const fileRelations = relations(file, ({ one }) => ({
	user: one(user, {
		fields: [file.ownerId],
		references: [user.id],
	}),
}))
