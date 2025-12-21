import camelcaseKeys from 'camelcase-keys'
import { eq, inArray, sql } from 'drizzle-orm'

import { seo, type Seo } from '~/lib/db/schema'
import { convertDateFields } from '~/lib/db/utils'
import { handleError } from '~/lib/utils/server'

import { dbStore } from './db.server'
import {
	product,
	productAttribute,
	productCrossSell,
	productGallery,
	productOption,
	productToBrand,
	productToCategory,
	productToTag,
	productUpsell,
	productVariant,
	type ProductStatus,
} from './schema/product'
import { ecAttribute, ecBrand, ecCategory, ecTag } from './schema/taxonomy'

type TransactionType = Parameters<
	Parameters<(typeof dbStore)['transaction']>[0]
>[0]

type Product = typeof product.$inferSelect
type ProductOption = typeof productOption.$inferSelect
type Category = typeof ecCategory.$inferSelect
type Tag = typeof ecTag.$inferSelect
type Brand = typeof ecBrand.$inferSelect

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
	categories: Category[]
	tags: Tag[]
	brands: Brand[]
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
								SELECT json_agg(
									json_build_object(
										'id', c.id,
										'name', c.name,
										'slug', c.slug,
										'description', c.description,
										'parentId', c.parent_id,
										'image', c.image,
										'order', pc.order
									)
								)
								FROM ${productToCategory} pc
								LEFT JOIN ${ecCategory} c ON pc.category_id = c.id
								WHERE pc.product_id = p.id
							),
							'[]'::json
						) AS categories,
						COALESCE(
							(
								SELECT json_agg(
									json_build_object(
										'id', t.id,
										'name', t.name,
										'slug', t.slug,
										'description', t.description,
										'image', t.image,
										'order', pt.order
									)
								)
								FROM ${productToTag} pt
								LEFT JOIN ${ecTag} t ON pt.tag_id = t.id
								WHERE pt.product_id = p.id
							),
							'[]'::json
						) AS tags,
						COALESCE(
							(
								SELECT json_agg(
									json_build_object(
										'id', b.id,
										'name', b.name,
										'slug', b.slug,
										'description', b.description,
										'parentId', b.parent_id,
										'image', b.image,
										'order', pb.order
									)
								)
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
	option: ProductOption
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
			categories: Category[]
			tags: Tag[]
			brands: Brand[]
			variants: ProductVariant[]
			attributes: ProductAttribute[]
			seo: Seo
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
					SELECT json_agg(
						json_build_object(
							'id', c.id,
							'name', c.name,
							'slug', c.slug,
							'description', c.description,
							'parentId', c.parent_id,
							'image', c.image,
							'order', pc.order
						)
					)
					FROM ${productToCategory} pc
					LEFT JOIN ${ecCategory} c ON pc.category_id = c.id
					WHERE pc.product_id = p.id
				),
				'[]'::json
			) AS categories,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', t.id,
							'name', t.name,
							'slug', t.slug,
							'description', t.description,
							'image', t.image,
							'order', pt.order
						)
					)
					FROM ${productToTag} pt
					LEFT JOIN ${ecTag} t ON pt.tag_id = t.id
					WHERE pt.product_id = p.id
				),
				'[]'::json
			) AS tags,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', b.id,
							'name', b.name,
							'slug', b.slug,
							'description', b.description,
							'parentId', b.parent_id,
							'image', b.image,
							'order', pb.order
						)
					)
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
			) AS attributes,

			row_to_json(seo.*) AS seo

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

		LEFT JOIN ${seo} seo ON p.seo_id = seo.id

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

// ==============================
// Create / Update / Delete
// ==============================

type InsertUpsell = typeof productUpsell.$inferInsert
type InsertCrossSell = typeof productCrossSell.$inferInsert

export const createProduct = async (
	data: Omit<Product, 'id' | 'productOptionId' | 'seoId'> & {
		option: Omit<ProductOption, 'id'>
		categories: Category[]
		tags: Tag[]
		brands: Brand[]
		variants: ProductVariant[]
		attributes: ProductAttribute[]
		gallery: Awaited<ReturnType<typeof getProductGallery>>
		crossSellProductIds: ConnectCrossSellProducts
		upsellProductIds: ConnectUpsellProducts
		seo: Omit<Seo, 'autoGenerated' | 'id'>
	},
) => {
	const {
		option,
		categories,
		tags,
		brands,
		variants,
		attributes,
		gallery,
		crossSellProductIds,
		upsellProductIds,
		...productData
	} = data

	console.time('createProduct')

	await dbStore.transaction(async tx => {
		const promiseProductOption = async () => {
			console.time('productOption insert')
			const rows = await tx
				.insert(productOption)
				.values({ ...option, id: undefined })
				.returning()
			console.timeEnd('productOption insert')
			return rows[0]
		}
		const promiseProductSeo = async () => {
			console.time('productSeo insert')
			const rows = await tx
				.insert(seo)
				.values({
					...productData.seo,
					id: undefined,
					autoGenerated: true,
					route: null,
				})
				.returning()
			console.timeEnd('productSeo insert')
			return rows[0]
		}

		const [optionInserted, seoInserted] = await Promise.all([
			promiseProductOption(),
			promiseProductSeo(),
		])

		const promiseProduct = async () => {
			console.time('product insert')
			const rows = await tx
				.insert(product)
				.values({
					...productData,
					id: undefined,
					productOptionId: optionInserted.id,
					seoId: seoInserted.id,
				})
				.returning()
			console.timeEnd('product insert')
			return rows[0]
		}

		const productInserted = await promiseProduct()

		await Promise.all([
			connectProductCategories(tx, productInserted.id, categories || []),
			connectProductTags(tx, productInserted.id, tags || []),
			connectProductBrands(tx, productInserted.id, brands || []),
			connectProductVariants(tx, productInserted.id, variants || []),
			connectProductAttributes(tx, productInserted.id, attributes || []),
			connectProductGallery(tx, productInserted.id, gallery || []),
			connectCrossSellProducts(
				tx,
				productInserted.id,
				crossSellProductIds || [],
			),
			connectUpsellProducts(tx, productInserted.id, upsellProductIds || []),
		])
	})

	console.timeEnd('createProduct')
}

export const updateProduct = async (
	data: Product & {
		option: ProductOption
		categories: Category[]
		tags: Tag[]
		brands: Brand[]
		variants: ProductVariant[]
		attributes: ProductAttribute[]
		gallery: Awaited<ReturnType<typeof getProductGallery>>
		crossSellProductIds: ConnectCrossSellProducts
		upsellProductIds: ConnectUpsellProducts
		seo: Omit<Seo, 'autoGenerated' | 'createdAt' | 'updatedAt' | 'id'>
	},
) => {
	const {
		option,
		categories,
		tags,
		brands,
		variants,
		attributes,
		gallery,
		crossSellProductIds,
		upsellProductIds,
		...productData
	} = data

	console.time('updateProduct')

	await dbStore.transaction(async tx => {
		const promiseProduct = async () => {
			console.time('product')
			await tx
				.update(product)
				.set(productData)
				.where(eq(product.id, productData.id))
			console.timeEnd('product')
		}
		const promiseProductOption = async () => {
			console.time('productOption')
			await tx
				.update(productOption)
				.set(option)
				.where(eq(productOption.id, option.id))
			console.timeEnd('productOption')
		}
		const promiseProductSeo = async () => {
			console.time('productSeo')
			await tx
				.update(seo)
				.set({ ...productData.seo, autoGenerated: true, route: null }) // seo will be query along with product
				.where(eq(seo.id, productData.seoId))
			console.timeEnd('productSeo')
		}

		await Promise.all([
			promiseProduct(),
			promiseProductOption(),
			connectProductCategories(tx, productData.id, categories || []),
			connectProductTags(tx, productData.id, tags || []),
			connectProductBrands(tx, productData.id, brands || []),
			connectProductVariants(tx, productData.id, variants || []),
			connectProductAttributes(tx, productData.id, attributes || []),
			connectProductGallery(tx, productData.id, gallery || []),
			connectCrossSellProducts(tx, productData.id, crossSellProductIds || []),
			connectUpsellProducts(tx, productData.id, upsellProductIds || []),
			promiseProductSeo(),
		])
	})

	console.timeEnd('updateProduct')
}

// ===== Helper Functions =====

/**
 * 1. categories: Category[]
 * 2. tags: Tag[]
 * 3. brands: Brand[]
 * 4. variants: ProductVariant[]
 * 5. attributes: ProductAttribute[]
 * 6. gallery: ProductGallery[]
 * 7. crossSells: ("order" | "crossSellProductId")[]
 * 8. upsells: ("order" | "upsellProductId")[]
 */

/** Replace product categories */
async function connectProductCategories(
	tx: TransactionType,
	productId: number,
	categories: Category[],
) {
	console.time('connectProductCategories')

	// Delete existing associations
	await tx
		.delete(productToCategory)
		.where(eq(productToCategory.productId, productId))

	// Insert new associations
	if (categories.length > 0) {
		await tx.insert(productToCategory).values(
			categories.map((cat, index) => ({
				productId,
				categoryId: cat.id,
				order: index,
			})),
		)
	}

	console.timeEnd('connectProductCategories')
}

/** Replace product tags */
async function connectProductTags(
	tx: TransactionType,
	productId: number,
	tags: Tag[],
) {
	console.time('connectProductTags')

	// Delete existing associations
	await tx.delete(productToTag).where(eq(productToTag.productId, productId))

	// Insert new associations
	if (tags.length > 0) {
		await tx.insert(productToTag).values(
			tags.map((tag, index) => ({
				productId,
				tagId: tag.id,
				order: index,
			})),
		)
	}

	console.timeEnd('connectProductTags')
}

/** Replace product brands */
async function connectProductBrands(
	tx: TransactionType,
	productId: number,
	brands: Brand[],
) {
	console.time('connectProductBrands')

	// Delete existing associations
	await tx.delete(productToBrand).where(eq(productToBrand.productId, productId))

	// Insert new associations
	if (brands.length > 0) {
		await tx.insert(productToBrand).values(
			brands.map((brand, index) => ({
				productId,
				brandId: brand.id,
				order: index,
			})),
		)
	}

	console.timeEnd('connectProductBrands')
}

/** Replace product variants */
async function connectProductVariants(
	tx: TransactionType,
	productId: number,
	variants: ProductVariant[],
) {
	console.time('connectProductVariants')

	const existingVariants = await tx.query.productVariant.findMany({
		where: eq(productVariant.productId, productId),
	})

	// Collect option IDs to delete (those not being reused)
	const existingOptionIds = existingVariants.map(v => v.optionId)
	const optionIdsInUse = variants
		.map(v => v.option.id)
		.filter(id => existingOptionIds.includes(id))
	const optionIdsToDelete = existingOptionIds.filter(
		id => !optionIdsInUse.includes(id),
	)

	// Delete orphaned options
	if (optionIdsToDelete.length > 0) {
		await tx
			.delete(productOption)
			.where(inArray(productOption.id, optionIdsToDelete))
	}

	// Insert new variants
	if (variants.length > 0) {
		const optionIds = variants.map(v => v.option.id)
		const existingOptions = await tx
			.select({ id: productOption.id })
			.from(productOption)
			.where(inArray(productOption.id, optionIds))

		const existingOptionIds = new Set(existingOptions.map(o => o.id))

		// Classify: 1. toInsert (bulk), 2. toUpdate (loop)
		const optionsToInsert = variants
			.filter(v => !existingOptionIds.has(v.option.id))
			.map(v => v.option)

		const optionsToUpdate = variants
			.filter(v => existingOptionIds.has(v.option.id))
			.map(v => v.option)

		const insertedOptionIds = new Map<number, number>() // oldId -> newId
		if (optionsToInsert.length > 0) {
			const inserted = await tx
				.insert(productOption)
				.values(optionsToInsert)
				.returning({ id: productOption.id })

			optionsToInsert.forEach((opt, index) => {
				insertedOptionIds.set(opt.id, inserted[index].id)
			})
		}

		for (const opt of optionsToUpdate) {
			await tx
				.update(productOption)
				.set(opt)
				.where(eq(productOption.id, opt.id))
		}

		const variantsToInsert = variants.map(variant => {
			const optionIdDatabase =
				insertedOptionIds.get(variant.option.id) ?? variant.option.id
			const { combination, order } = variant
			return { combination, order, optionId: optionIdDatabase, productId }
		})

		// Delete and Insert variants at once
		await tx
			.delete(productVariant)
			.where(eq(productVariant.productId, productId))
		if (variantsToInsert.length > 0) {
			await tx.insert(productVariant).values(variantsToInsert)
		}
	}

	console.timeEnd('connectProductVariants')
}

/** Replace product attributes */
async function connectProductAttributes(
	tx: TransactionType,
	productId: number,
	attributes: ProductAttribute[],
) {
	console.time('connectProductAttributes')

	// Delete existing attributes
	await tx
		.delete(productAttribute)
		.where(eq(productAttribute.productId, productId))

	// Insert new attributes
	if (attributes.length > 0) {
		await tx.insert(productAttribute).values(
			attributes.map(
				attr =>
					({
						productId,
						name: attr.name,
						value: attr.value,
						attributeId: attr.attributeId,
						order: attr.order,
						selectType: attr.selectType,
						visible: attr.visible,
					}) satisfies typeof productAttribute.$inferInsert,
			),
		)
	}

	console.timeEnd('connectProductAttributes')
}

/** Replace product gallery images */
async function connectProductGallery(
	tx: TransactionType,
	productId: number,
	gallery: Awaited<ReturnType<typeof getProductGallery>>,
) {
	console.time('connectProductGallery')

	// Delete existing associations
	await tx.delete(productGallery).where(eq(productGallery.productId, productId))

	// Insert new associations (including order)
	if (gallery.length > 0) {
		await tx.insert(productGallery).values(gallery)
	}

	console.timeEnd('connectProductGallery')
}

export type ConnectCrossSellProducts = Pick<
	InsertCrossSell,
	'crossSellProductId' | 'order'
>[]

/** Replace cross-sell products */
async function connectCrossSellProducts(
	tx: TransactionType,
	productId: number,
	values: ConnectCrossSellProducts,
) {
	console.time('connectCrossSellProducts')

	// Delete existing associations
	await tx
		.delete(productCrossSell)
		.where(eq(productCrossSell.productId, productId))

	// Insert new associations (including order)
	if (values.length > 0) {
		await tx
			.insert(productCrossSell)
			.values(values.map(v => ({ ...v, productId })))
	}

	console.timeEnd('connectCrossSellProducts')
}

export type ConnectUpsellProducts = Pick<
	InsertUpsell,
	'upsellProductId' | 'order'
>[]

/** Replace upsell products */
async function connectUpsellProducts(
	tx: TransactionType,
	productId: number,
	values: ConnectUpsellProducts,
) {
	console.time('connectUpsellProducts')

	// Delete existing associations
	await tx.delete(productUpsell).where(eq(productUpsell.productId, productId))

	// Insert new associations (including order)
	if (values.length > 0) {
		await tx
			.insert(productUpsell)
			.values(values.map(v => ({ ...v, productId })))
	}

	console.timeEnd('connectUpsellProducts')
}

type DeleteProductResult = {
	success: boolean
	deleted: Array<{ id: number; name: string }>
	notFound: number[]
	errors: Array<{ id: number; error: string }>
}

/** Delete products (soft delete by default, or hard delete) */
export async function deleteProducts(
	productIds: number[],
): Promise<DeleteProductResult> {
	const result: DeleteProductResult = {
		success: false,
		deleted: [],
		notFound: [],
		errors: [],
	}

	if (productIds.length === 0) {
		return result
	}

	await dbStore.transaction(async tx => {
		// 1. Query existing products
		const existingProducts = await tx
			.select({
				id: product.id,
				name: product.name,
				productOptionId: product.productOptionId,
				seoId: product.seoId,
			})
			.from(product)
			.where(inArray(product.id, productIds))

		// 2. Collect not found IDs
		const foundIds = existingProducts.map(p => p.id)
		result.notFound = productIds.filter(id => !foundIds.includes(id))

		// 3. Early return if no existing products
		if (existingProducts.length === 0) {
			return result
		}

		// 4. Delete products and related records
		for (const p of existingProducts) {
			try {
				// Delete the product itself (cascading deletes related tables)
				await tx.delete(product).where(eq(product.id, p.id))

				// Delete related productOption
				await tx
					.delete(productOption)
					.where(eq(productOption.id, p.productOptionId))

				// Delete related seo
				await tx.delete(seo).where(eq(seo.id, p.seoId))

				result.deleted.push({ id: p.id, name: p.name })
			} catch (error) {
				const errorResult = handleError(error, undefined, {})
				result.errors.push({
					id: p.id,
					error: errorResult.err,
				})
			}
		}

		result.success = result.errors.length === 0
	})

	return result
}

/** Move products to trash */
export async function moveProductsToTrash(
	productIds: number[],
): Promise<DeleteProductResult> {
	const result: DeleteProductResult = {
		success: false,
		deleted: [],
		notFound: [],
		errors: [],
	}

	if (productIds.length === 0) {
		return result
	}

	// Soft delete
	try {
		const deletedProducts = await dbStore
			.update(product)
			.set({ status: 'TRASHED', deletedAt: new Date() })
			.where(inArray(product.id, productIds))
			.returning({ id: product.id, name: product.name })

		result.deleted = deletedProducts
		result.notFound = productIds.filter(
			id => !deletedProducts.some(p => p.id === id),
		)
		result.success = result.deleted.length > 0
	} catch (error) {
		const errorResult = handleError(error, undefined, {})
		// If the bulk delete fails, try deleting one by one to collect errors
		productIds.forEach(id => {
			result.errors.push({
				id,
				error: errorResult.err,
			})
		})
	}

	return result
}
