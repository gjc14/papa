import { inArray, type InferInsertModel } from 'drizzle-orm'

import { dbStore } from './db.server'
import * as schema from './schema'

export const createEcTag = async (
	props: InferInsertModel<typeof schema.ecTag>,
) => {
	const [tag] = await dbStore.insert(schema.ecTag).values(props).returning()
	return tag
}

export const getEcTags = async () => {
	const tags = await dbStore.query.ecTag.findMany()

	return tags
}

export const deleteEcTags = async (
	ids: (typeof schema.ecCategory.$inferSelect)['id'][],
) => {
	await dbStore
		.delete(schema.ecCategory)
		.where(inArray(schema.ecCategory.id, ids))
}

export const createEcCategory = async (
	props: InferInsertModel<typeof schema.ecCategory>,
) => {
	const [category] = await dbStore
		.insert(schema.ecCategory)
		.values(props)
		.returning()
	return category
}

export const getEcCategories = async () => {
	const categories = await dbStore.query.ecCategory.findMany()

	return categories
}

export const deleteEcCategories = async (
	ids: (typeof schema.ecBrand.$inferSelect)['id'][],
) => {
	await dbStore.delete(schema.ecBrand).where(inArray(schema.ecBrand.id, ids))
}

export const createEcBrand = async (
	props: InferInsertModel<typeof schema.ecBrand>,
) => {
	const [brand] = await dbStore.insert(schema.ecBrand).values(props).returning()
	return brand
}

export const getEcBrands = async () => {
	const brands = await dbStore.query.ecBrand.findMany()

	return brands
}

export const deleteEcBrands = async (
	ids: (typeof schema.ecAttribute.$inferSelect)['id'][],
) => {
	await dbStore
		.delete(schema.ecAttribute)
		.where(inArray(schema.ecAttribute.id, ids))
}

export const createEcAttribute = async (
	props: InferInsertModel<typeof schema.ecAttribute>,
) => {
	const [attribute] = await dbStore
		.insert(schema.ecAttribute)
		.values(props)
		.returning()
	return attribute
}

export const getEcAttributes = async () => {
	const attributes = await dbStore.query.ecAttribute.findMany()

	return attributes
}

export const deleteEcAttributes = async (
	ids: (typeof schema.ecAttribute.$inferSelect)['id'][],
) => {
	await dbStore
		.delete(schema.ecAttribute)
		.where(inArray(schema.ecAttribute.id, ids))
}
