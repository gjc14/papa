import camelcaseKeys from 'camelcase-keys'
import { sql } from 'drizzle-orm'

import { convertDateFields } from '~/lib/db/utils'

import { dbStore } from './db.server'
import {
	product,
	productAttribute,
	productCrossSell,
	productOption,
	productToBrand,
	productToCategory,
	productToTag,
	productUpsell,
	productVariant,
	type ProductStatus,
} from './schema/product'
import { ecAttribute, ecBrand, ecCategory, ecTag } from './schema/taxonomy'

type Product = typeof product.$inferSelect
type ProductOption = typeof productOption.$inferSelect

export type ProductListing = Pick<
	Product,
	'id' | 'name' | 'slug' | 'status' | 'updatedAt'
> & {
	option: Pick<
		ProductOption,
		| 'id'
		| 'image'
		| 'price'
		| 'salePrice'
		| 'scale'
		| 'currency'
		| 'sku'
		| 'manageStock'
		| 'stockStatus'
		// TODO: add stockQuantity if manageStock is 1
	>
}

export type ProductListingWithRelations = ProductListing & {
	categories: (typeof ecCategory.$inferSelect)[]
	tags: (typeof ecTag.$inferSelect)[]
	brands: (typeof ecBrand.$inferSelect)[]
}

type GetProductsParamsBase = {
	/** Filter by product status (default: 'PUBLISHED'). Use 'ALL' to fetch all statuses. */
	status?: ProductStatus | 'ALL'
	/** Array of category slugs to filter products by category. */
	categories?: string[]
	/** Array of tag slugs to filter products by tags. */
	tags?: string[]
	/** Array of brand slugs to filter products by brands. */
	brands?: string[]
	/** Array of attribute slugs to filter products by attributes. */
	attributes?: string[]
	/** Search term to filter products by name (case-insensitive, partial match). */
	title?: string
}

type PriceFields = {
	price: bigint
	salePrice: bigint | null
}

function convertPriceStringToBigInt<T extends PriceFields>(data: T): T {
	const result = { ...data }

	if (typeof result.price === 'string') {
		result.price = BigInt(result.price)
	}

	if (typeof result.salePrice === 'string') {
		result.salePrice = BigInt(result.salePrice)
	}

	return result
}

export async function getProducts(
	params?: GetProductsParamsBase & {
		relations?: false
	},
): Promise<ProductListing[]>
export async function getProducts(
	params: GetProductsParamsBase & {
		relations: true
	},
): Promise<ProductListingWithRelations[]>
/**
 * Fetch compact products for listing purpose from the database with optional filters.
 * @returns An object containing an array of products matching the filters.
 */
export async function getProducts({
	status = 'PUBLISHED',
	categories = [],
	tags = [],
	attributes = [],
	brands = [],
	title,
	relations = false,
}: GetProductsParamsBase & { relations?: boolean } = {}) {
	console.time('getProducts')
	const products = await dbStore.execute<
		ProductListing | ProductListingWithRelations
	>(sql`
		SELECT
		DISTINCT ON (p.id)
			p.id,
			p.name,
			p.slug,
			p.status,
			p.updated_at,
			CASE
				WHEN po.id IS NOT NULL 
				THEN json_build_object(
					'id', po.id,
					'image', po.image,
					'price', po.price::text,
					'sale_price', po.sale_price::text,
					'scale', po.scale,
					'currency', po.currency,
					'sku', po.sku,
					'manage_stock', po.manage_stock,
					'stock_status', po.stock_status
				)
				ELSE NULL 
       		END AS option
			${
				relations
					? sql`
						,
						COALESCE(
							(
								SELECT json_agg(c)
								FROM ${productToCategory} pc
								LEFT JOIN ${ecCategory} c ON pc.category_id = c.id
								WHERE pc.product_id = p.id
							),
							'[]'::json
						) AS categories,
						COALESCE(
							(
								SELECT json_agg(t)
								FROM ${productToTag} pt
								LEFT JOIN ${ecTag} t ON pt.tag_id = t.id
								WHERE pt.product_id = p.id
							),
							'[]'::json
						) AS tags,
						COALESCE(
							(
								SELECT json_agg(b)
								FROM ${productToBrand} pb
								LEFT JOIN ${ecBrand} b ON pb.brand_id = b.id
								WHERE pb.product_id = p.id
							),
							'[]'::json
						) AS brands`
					: undefined
			}

		FROM ${product} p
		LEFT JOIN ${productOption} po ON p.product_option_id = po.id

		LEFT JOIN ${productToTag} ptt ON p.id = ptt.product_id
		LEFT JOIN ${ecTag} et ON ptt.tag_id = et.id

		LEFT JOIN ${productToCategory} ptc ON p.id = ptc.product_id
		LEFT JOIN ${ecCategory} ec ON ptc.category_id = ec.id

		LEFT JOIN ${productToBrand} ptb ON p.id = ptb.product_id
		LEFT JOIN ${ecBrand} eb ON ptb.brand_id = eb.id

		WHERE
			${status !== 'ALL' ? sql`p.status = ${status}` : sql`TRUE`}
			AND	${title ? sql`p.name ILIKE ${'%' + title + '%'}` : sql`TRUE`}
			AND	${categories.length ? sql`ec.slug = ANY(ARRAY[${sql.join(categories, sql`,`)}])` : sql`TRUE`}
			AND	${tags.length ? sql`et.slug = ANY(ARRAY[${sql.join(tags, sql`,`)}])` : sql`TRUE`}
			AND	${brands.length ? sql`eb.slug = ANY(ARRAY[${sql.join(brands, sql`,`)}])` : sql`TRUE`}
			AND	${attributes.length ? sql`ea.slug = ANY(ARRAY[${sql.join(attributes, sql`,`)}])` : sql`TRUE`}
	`)
	console.timeEnd('getProducts')

	const validProducts = convertDateFields(
		camelcaseKeys(products.rows, { deep: true }),
		['updatedAt'],
	).filter(product => {
		if (!product.option) {
			console.error(`Product ${product.id} has no productOption`)
			return false
		}
		return true
	})

	return validProducts.map(p => ({
		...p,
		option: convertPriceStringToBigInt(p.option),
	}))
}

export type ProductWithOption = Product & {
	option: ProductOption
}

/** Single product select attribute type */
export type ProductVariant = typeof productVariant.$inferSelect & {
	option: typeof productOption.$inferSelect
}

/** Single product select attribute type */
export type ProductAttribute = Omit<
	typeof productAttribute.$inferSelect,
	'productId'
>

/**
 * Fetch a single product by its slug from the database, including its option and related taxonomy.
 * @param slug - The slug of the product to fetch.
 * @param preview - If true, fetch the product regardless of its status. Defaults to false.
 * @returns The product with its option and related taxonomy, or null if not found.
 */
export const getProduct = async ({
	slug,
	preview = false,
	edit = false,
	status = 'PUBLISHED',
}: {
	slug: string
	preview?: boolean
	edit?: boolean
	status?: ProductStatus
}) => {
	console.time('getProduct')
	const products = await dbStore.execute<
		ProductWithOption & {
			categories: (typeof ecCategory.$inferSelect)[]
			tags: (typeof ecTag.$inferSelect)[]
			brands: (typeof ecBrand.$inferSelect)[]
			variants: ProductVariant[]
			attributes: ProductAttribute[]
		}
	>(sql`
		SELECT
		DISTINCT ON (p.id)
			p.*,
			CASE 
                WHEN po.id IS NOT NULL 
                THEN
					(row_to_json(po.*)::jsonb - 'price' - 'sale_price')
					|| jsonb_build_object('price', po.price::text, 'sale_price', po.sale_price::text)
                ELSE NULL 
            END AS option,
			COALESCE(
				(
					SELECT json_agg(c)
					FROM ${productToCategory} pc
					LEFT JOIN ${ecCategory} c ON pc.category_id = c.id
					WHERE pc.product_id = p.id
				),
				'[]'::json
			) AS categories,
			COALESCE(
				(
					SELECT json_agg(t)
					FROM ${productToTag} pt
					LEFT JOIN ${ecTag} t ON pt.tag_id = t.id
					WHERE pt.product_id = p.id
				),
				'[]'::json
			) AS tags,
			COALESCE(
				(
					SELECT json_agg(b)
					FROM ${productToBrand} pb
					LEFT JOIN ${ecBrand} b ON pb.brand_id = b.id
					WHERE pb.product_id = p.id
				),
				'[]'::json
			) AS brands,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', pv.id,
							'product_id', pv.product_id,
							'option_id', pv.option_id,
							'combination', pv.combination,
							'order', pv.order,
							'option', CASE
							 	WHEN po.id IS NOT NULL 
								THEN
									(row_to_json(po.*)::jsonb - 'price' - 'sale_price')
									|| jsonb_build_object('price', po.price::text, 'sale_price', po.sale_price::text)
								ELSE NULL
							END
						) ORDER BY pv.order ASC
					)
					FROM ${productVariant} pv
					LEFT JOIN ${productOption} po ON pv.option_id = po.id
					WHERE pv.product_id = p.id
				),
				'[]'::json
			) AS variants,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', pa.id,
							'attribute_id', pa.attribute_id,
							'name', CASE 
								WHEN pa.attribute_id IS NOT NULL AND a.name IS NOT NULL 
								THEN a.name 
								ELSE pa.name 
							END,
							'value', CASE 
								WHEN pa.attribute_id IS NOT NULL AND a.value IS NOT NULL 
								THEN a.value 
								ELSE pa.value 
							END,
							'order', pa.order,
							'select_type', pa.select_type,
							'visible', pa.visible
						) ORDER BY pa.order ASC
					)
					FROM ${productAttribute} pa
					LEFT JOIN ${ecAttribute} a ON pa.attribute_id = a.id
					WHERE pa.product_id = p.id
				),
				'[]'::json
			) AS attributes

		FROM ${product} p
		LEFT JOIN ${productOption} po ON p.product_option_id = po.id

		LEFT JOIN ${productToTag} ptt ON p.id = ptt.product_id
		LEFT JOIN ${ecTag} et ON ptt.tag_id = et.id

		LEFT JOIN ${productToCategory} ptc ON p.id = ptc.product_id
		LEFT JOIN ${ecCategory} ec ON ptc.category_id = ec.id

		LEFT JOIN ${productToBrand} ptb ON p.id = ptb.product_id
		LEFT JOIN ${ecBrand} eb ON ptb.brand_id = eb.id

		LEFT JOIN ${productAttribute} pta ON p.id = pta.product_id
		LEFT JOIN ${ecAttribute} ea ON pta.attribute_id = ea.id

		WHERE
			p.slug = ${slug}
			AND ${!(preview || edit) ? sql`p.status = ${status}` : sql`TRUE`}
	`)
	console.timeEnd('getProduct')

	const pLength = products.rows.length

	if (pLength === 0) return null

	if (pLength === 1) {
		const p = products.rows[0]

		if (!p.option) {
			console.error(`Product ${p.id} has no productOption`)
			return null
		}

		const product = convertDateFields(
			camelcaseKeys(p, { deep: true, stopPaths: ['variants.combination'] }),
			[
				'createdAt',
				'updatedAt',
				'deletedAt',
				'publishedAt',
				'saleStartsAt',
				'saleEndsAt',
			],
		)

		return {
			...product,
			option: convertPriceStringToBigInt(product.option),
			variants: product.variants.map(variant => ({
				...variant,
				option: convertPriceStringToBigInt(variant.option),
			})),
		}
	}

	// Should never happen since slug is unique
	console.error(`Expected 1 or 0 product, got ${pLength} from slug ${slug}`)
	return null
}

export const getProductGallery = async (productId: number) => {
	const gallery = await dbStore.query.productGallery.findMany({
		where: (gallery, { eq }) => eq(gallery.productId, productId),
	})
	return gallery
}

export type CrossSellProduct = ProductListing &
	Pick<typeof productCrossSell.$inferSelect, 'order'>

export const getCrossSellProducts = async (
	productId: number,
): Promise<CrossSellProduct[]> => {
	const crossSells = await dbStore.execute<CrossSellProduct>(sql`
		SELECT
		DISTINCT ON (p.id)
			p.id,
			p.name,
			p.slug,
			p.status,
			p.updated_at,
			pcs.order,
			CASE
				WHEN po.id IS NOT NULL
				THEN json_build_object(
					'id', po.id,
					'image', po.image,
					'price', po.price::text,
					'sale_price', po.sale_price::text,
					'scale', po.scale,
					'currency', po.currency,
					'sku', po.sku,
					'manage_stock', po.manage_stock,
					'stock_status', po.stock_status
				)
				ELSE NULL
	   		END AS option
		FROM ${productCrossSell} pcs
		LEFT JOIN ${product} p ON p.id = pcs.cross_sell_product_id
		LEFT JOIN ${productOption} po ON p.product_option_id = po.id
		WHERE pcs.product_id = ${productId}
	`)

	const converted = convertDateFields(
		camelcaseKeys(crossSells.rows, { deep: true }),
		['updatedAt'],
	)

	return converted.map(p => ({
		...p,
		option: convertPriceStringToBigInt(p.option),
	}))
}

export type UpsellProduct = ProductListing &
	Pick<typeof productUpsell.$inferSelect, 'order'>

export const getUpsellProducts = async (
	productId: number,
): Promise<UpsellProduct[]> => {
	const upsells = await dbStore.execute<UpsellProduct>(sql`
		SELECT
		DISTINCT ON (p.id)
			p.id,
			p.name,
			p.slug,
			p.status,
			p.updated_at,
			pus.order,
			CASE
				WHEN po.id IS NOT NULL
				THEN json_build_object(
					'id', po.id,
					'image', po.image,
					'price', po.price::text,
					'sale_price', po.sale_price::text,
					'scale', po.scale,
					'currency', po.currency,
					'sku', po.sku,
					'manage_stock', po.manage_stock,
					'stock_status', po.stock_status
				)
				ELSE NULL
	   		END AS option
		FROM ${productUpsell} pus
		LEFT JOIN ${product} p ON p.id = pus.upsell_product_id
		LEFT JOIN ${productOption} po ON p.product_option_id = po.id
		WHERE pus.product_id = ${productId}
	`)

	const converted = convertDateFields(
		camelcaseKeys(upsells.rows, { deep: true }),
		['updatedAt'],
	)

	return converted.map(p => ({
		...p,
		option: convertPriceStringToBigInt(p.option),
	}))
}
