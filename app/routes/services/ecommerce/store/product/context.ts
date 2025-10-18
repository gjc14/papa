import { atom } from 'jotai'

import type {
	getCrossSellProducts,
	getProduct,
	getProductGallery,
	getUpsellProducts,
} from '../../lib/db/product.server'
import type {
	EcBrand as Brand,
	EcCategory as Category,
	EcTag as Tag,
} from '../../lib/db/schema'

type StoreConfig = {
	id: number
	/** Name of the store, used for SEO @default "Store" */
	name: string
	/** Absolute path for the store @default "/store" */
	storeFrontPath: string
	/**
	 * BCP 47 language tag for the store @default "en-US"
	 * @see https://datatracker.ietf.org/doc/html/rfc5646
	 * @see https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag
	 */
	language: string
	inventory: {
		unitSettings: {
			weight: string
			length: string
			volume: string
		}
		lowStockThreshold: number
	}
}

export const storeConfigAtom = atom<StoreConfig>({
	id: -1,
	name: 'Store',
	storeFrontPath: '/store',
	language: 'en-US',
	inventory: {
		unitSettings: {
			weight: 'g',
			length: 'mm',
			volume: 'l',
		},
		lowStockThreshold: 0,
	},
})

export const productAtom = atom<Awaited<ReturnType<typeof getProduct>>>(null)
export type Product = Awaited<ReturnType<typeof getProduct>>

// === Product Related Data ===
export const productGalleryAtom = atom<Awaited<
	ReturnType<typeof getProductGallery>
> | null>(null)
export const crossSellProductsAtom = atom<Awaited<
	ReturnType<typeof getCrossSellProducts>
> | null>(null)
export const upsellProductsAtom = atom<Awaited<
	ReturnType<typeof getUpsellProducts>
> | null>(null)

// === Taxonomies ===
export const tagsAtom = atom<Tag[]>([])
export const categoriesAtom = atom<Category[]>([])
export const brandsAtom = atom<Brand[]>([])

// === States ===
export const isResolvingAtom = atom<{
	productGallery: boolean
	crossSellProducts: boolean
}>({ productGallery: true, crossSellProducts: true })

export const selectedAttributesAtom = atom<Record<string, string>>({})

export const hoveredAttributeImageAtom = atom<{
	image: string
	imageAlt: string | null
	imageTitle: string | null
}>()
