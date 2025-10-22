/**
 * == Product schema ==
 * - product
 * - product_option
 * TODO: refer to - inventory table
 * TODO: refer to - shipping class table
 *
 * - product_attribute
 * - product_variant
 *
 * Every product will have one product_option as default,
 * other options are variants, stored in product_variants table,
 * these variants are generated from product attributes.
 *
 * == Associative tables ==
 * product table to ec taxonomy tables
 * 1. products <-> tags
 * 2. products <-> categories
 * 3. products <-> brands
 * 4. products <-> attributes
 * 5. products <-> images (gallery)
 *
 * Each associative table will have an "order" column to define the order of the items.
 *
 * == Linked products ==
 * associating products to other products
 * - cross_sell
 * - upsell
 *
 * == Review ==
 */

import { relations } from 'drizzle-orm'
import {
	bigint,
	check,
	index,
	integer,
	jsonb,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm/sql/sql'

import { seo } from '~/lib/db/schema'
import { user } from '~/lib/db/schema/auth'
import {
	deletedAtAttribute,
	pgTable,
	timestampAttributes,
} from '~/lib/db/schema/helpers'

import { ecAttribute, ecBrand, ecCategory, ecTag } from './taxonomy'

export const ProductStatus = [
	'DRAFT',
	'SCHEDULED',
	'PUBLISHED',
	'ARCHIVED',
	'TRASHED',
	'OTHER',
] as const
export type ProductStatus = (typeof ProductStatus)[number]

export const ProductVisibility = ['PUBLIC', 'PRIVATE', 'PROTECTED'] as const
export type ProductVisibility = (typeof ProductVisibility)[number]

export const ProductAttributeSelectType = [
	'SELECTOR',
	'BUTTON',
	'HIDDEN',
] as const
export type ProductAttributeSelectType =
	(typeof ProductAttributeSelectType)[number]

export type ProductInstruction = {
	order: number
	title: string
	content: string | null
}

// Product metadata
export const product = pgTable(
	'ec_product',
	{
		id: serial('id').primaryKey(),
		status: varchar('status', { length: 20 })
			.$type<ProductStatus>()
			.notNull()
			.default('DRAFT'),
		slug: varchar('slug').notNull().unique(),
		name: varchar('name').notNull(),
		subtitle: varchar('subtitle'),
		description: varchar('description'),
		instructions: jsonb('instructions').$type<ProductInstruction[]>(),
		purchaseNote: varchar('purchase_note'),

		productOptionId: integer('product_option_id')
			.notNull()
			.references(() => productOption.id, { onDelete: 'restrict' }),

		visibility: varchar('visibility', { length: 20 })
			.$type<ProductVisibility>()
			.notNull()
			.default('PUBLIC'),
		password: varchar('password'),

		lang: varchar('lang', { length: 10 }).notNull().default('en'),

		authorId: text('author_id').references(() => user.id, {
			onDelete: 'set null',
		}),

		seoId: integer('seo_id')
			.references(() => seo.id, {
				onDelete: 'restrict',
			})
			.notNull(),

		publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
		...timestampAttributes,
		...deletedAtAttribute,
	},
	t => [check('prevent_system_slug', sql`${t.slug} != 'new'`)],
)

export type DownloadFile = { name: string; url: string }

export const StockStatus = ['inStock', 'outOfStock', 'onBackOrder'] as const
export type StockStatus = (typeof StockStatus)[number]

export type ProductDimension = { length: number; width: number; height: number }

// Product default option and option of variants
export const productOption = pgTable(
	'ec_product_option',
	{
		id: serial('id').primaryKey(),
		active: integer('active').notNull().default(1),
		image: varchar('image'),
		imageAlt: varchar('image_alt'),
		imageTitle: varchar('image_title'),

		// Please save $19.99 as 1999 + scale 2; $18.999 as 18999 + scale 3
		price: bigint('price', { mode: 'bigint' })
			.notNull()
			.default(sql`'0'::bigint`),
		salePrice: bigint('sale_price', { mode: 'bigint' }).default(
			sql`'0'::bigint`,
		),
		saleStartsAt: timestamp('sale_starts_at', { withTimezone: true }),
		saleEndsAt: timestamp('sale_ends_at', { withTimezone: true }),
		currency: varchar('currency', { length: 6 }).notNull().default('USD'),
		scale: integer('scale').notNull().default(2),

		// TODO: add taxStatus / taxClass

		// Quantity limits
		minQtyAllowed: integer('min_qty_allowed').notNull().default(1),
		maxQtyAllowed: integer('max_qty_allowed'),
		step: integer('step').notNull().default(1), // quantity step increment

		// downloadable toggle
		downloadable: integer('downloadable').notNull().default(0),

		downloadFiles: jsonb('download_files').$type<DownloadFile[]>(),
		downloadLimit: integer('download_limit'),
		downloadExpiry: integer('download_expiry'), // in seconds

		sku: varchar('sku', { length: 100 }),
		identifier: varchar('identifier', { length: 255 }), // e.g. GTIN, UPC, EAN, or ISBN

		// stock management
		manageStock: integer('manage_stock').notNull().default(0),

		stockStatus: varchar('stock_status')
			.$type<StockStatus>()
			.notNull()
			.default('inStock'),
		// TODO: refer to inventory table
		// inventoryId: integer('inventory_id'),
		// qty: integer('qty').notNull().default(0),
		// minQty: integer('min_qty'),
		// allowBackorder: integer('allow_backorder').notNull().default(0),

		// virtual or physical
		virtual: integer('virtual').notNull().default(0),
		weight: integer('weight'), // in grams
		dimension: jsonb('dimension').$type<ProductDimension>(),
		// TODO: refer to class table
		// classId: integer('class_id').references(() => ecShippingClass.id, {
		// 	onDelete: 'set null',
		// }),

		note: text('note'),
	},
	t => [
		check('scale_non_negative', sql`${t.scale} >= 0`),
		check('step_positive', sql`${t.step} >= 1`),
		check('min_qty_allowed_positive', sql`${t.minQtyAllowed} >= 1`),
		check(
			'max_qty_allowed_non_negative',
			sql`${t.maxQtyAllowed} IS NULL OR ${t.maxQtyAllowed} >= 0`,
		),
		check('weight_non_negative', sql`${t.weight} IS NULL OR ${t.weight} >= 0`),
		check(
			'download_limit_non_negative',
			sql`${t.downloadLimit} IS NULL OR ${t.downloadLimit} >= 0`,
		),
		check(
			'download_expiry_non_negative',
			sql`${t.downloadExpiry} IS NULL OR ${t.downloadExpiry} >= 0`,
		),

		// If downloadable = 1 then downloadFiles must be present (simple check)
		check(
			'downloadable_requires_files',
			sql`(${t.downloadable} = 0) OR (${t.downloadFiles} IS NOT NULL AND jsonb_array_length(${t.downloadFiles}) > 0)`,
		),

		// If manageStock = 1 then qty/minQty must be set and qty >= 0; if manageStock = 0 allow qty defaults but ensure stockStatus exists
		// check(
		// 	'manage_stock_consistency',
		// 	sql`(${t.manageStock} = 0) OR (${t.manageStock} = 1 AND ${t.inventoryId} IS NOT NULL)`,
		// ),

		// If virtual = 1 then no physical dimensions/weight/class allowed
		check(
			'virtual_excludes_physical',
			sql`(${t.virtual} = 0) OR (${t.virtual} = 1 AND ${t.weight} IS NULL AND ${t.dimension} IS NULL)`,
		),
	],
)

// Choose from either attribute or name/value
export const productAttribute = pgTable(
	'ec_product_attribute',
	{
		id: serial('id').primaryKey(),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		attributeId: integer('attribute_id').references(() => ecAttribute.id, {
			onDelete: 'cascade',
		}),
		name: varchar('name', { length: 100 }),
		value: varchar('value', { length: 255 }),
		order: integer('order').notNull().default(0),
		selectType: varchar('select_type', { length: 10 })
			.$type<ProductAttributeSelectType>()
			.notNull()
			.default('SELECTOR'),
		visible: integer('visible').notNull().default(1),
	},
	t => [
		check(
			'attribute_or_name_value',
			sql`${t.attributeId} IS NOT NULL OR (${t.name} IS NOT NULL AND ${t.value} IS NOT NULL)`,
		),
	],
)

export type ProductVariantCombination = Record<string, string>

// Generate product variants and its options from product attributes
export const productVariant = pgTable('ec_product_variant', {
	id: serial('id').primaryKey(),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
	optionId: integer('option_id')
		.notNull()
		.references(() => productOption.id, { onDelete: 'cascade' }),
	combination: jsonb('combination')
		.$type<ProductVariantCombination>()
		.notNull(), // e.g.,{ color: 'red', weight: '100g' }
	order: integer('order').notNull().default(0),
})

// === Associative tables ===

export const productToTag = pgTable(
	'ec_product_to_tag',
	{
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => ecTag.id, { onDelete: 'cascade' }),
		order: integer('order').notNull().default(0),
	},
	t => [
		primaryKey({ columns: [t.productId, t.tagId] }), // Composite primary key
		index('ec_product_to_tag_product_id_idx').on(t.productId),
		index('ec_product_to_tag_tag_id_idx').on(t.tagId),
	],
)

export const productToCategory = pgTable(
	'ec_product_to_category',
	{
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		categoryId: integer('category_id')
			.notNull()
			.references(() => ecCategory.id, { onDelete: 'cascade' }),
		order: integer('order').notNull().default(0),
	},
	t => [
		primaryKey({ columns: [t.productId, t.categoryId] }), // Composite primary key
		index('ec_product_to_category_product_id_idx').on(t.productId),
		index('ec_product_to_category_category_id_idx').on(t.categoryId),
	],
)

export const productToBrand = pgTable(
	'ec_product_to_brand',
	{
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		brandId: integer('brand_id')
			.notNull()
			.references(() => ecBrand.id, { onDelete: 'cascade' }),
		order: integer('order').notNull().default(0),
	},
	t => [
		primaryKey({ columns: [t.productId, t.brandId] }), // Composite primary key
		index('ec_product_to_brand_product_id_idx').on(t.productId),
		index('ec_product_to_brand_brand_id_idx').on(t.brandId),
	],
)

export const productGallery = pgTable(
	'ec_product_gallery',
	{
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		image: varchar('image').notNull(),
		order: integer('order').notNull().default(0),
		alt: varchar('alt'),
		title: varchar('title'),
	},
	t => [
		primaryKey({ columns: [t.productId, t.image] }), // Composite primary key
		index('ec_product_gallery_product_id_idx').on(t.productId),
	],
)

// Linked products - cross sell
export const productCrossSell = pgTable('ec_product_cross_sell', {
	id: serial('id').primaryKey(),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
	crossSellProductId: integer('cross_sell_product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
	order: integer('order').notNull().default(0),
})

// Linked products - upsell
export const productUpsell = pgTable('ec_product_upsell', {
	id: serial('id').primaryKey(),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
	upsellProductId: integer('upsell_product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
	order: integer('order').notNull().default(0),
})

// === Relations ===

export const productToTagRelation = relations(productToTag, ({ one }) => ({
	product: one(product, {
		fields: [productToTag.productId],
		references: [product.id],
	}),
	tag: one(ecTag, {
		fields: [productToTag.tagId],
		references: [ecTag.id],
	}),
}))

export const productToCategoryRelations = relations(
	productToCategory,
	({ one }) => ({
		product: one(product, {
			fields: [productToCategory.productId],
			references: [product.id],
		}),
		category: one(ecCategory, {
			fields: [productToCategory.categoryId],
			references: [ecCategory.id],
		}),
	}),
)

export const productToBrandRelations = relations(productToBrand, ({ one }) => ({
	product: one(product, {
		fields: [productToBrand.productId],
		references: [product.id],
	}),
	brand: one(ecBrand, {
		fields: [productToBrand.brandId],
		references: [ecBrand.id],
	}),
}))

export const productRelations = relations(product, ({ one }) => ({
	productOption: one(productOption, {
		fields: [product.productOptionId],
		references: [productOption.id],
	}),
	author: one(user, {
		fields: [product.authorId],
		references: [user.id],
	}),
	seo: one(seo, {
		fields: [product.seoId],
		references: [seo.id],
	}),
}))

export const productVariantRelations = relations(productVariant, ({ one }) => ({
	product: one(product, {
		fields: [productVariant.productId],
		references: [product.id],
	}),
	option: one(productOption, {
		fields: [productVariant.optionId],
		references: [productOption.id],
	}),
}))
