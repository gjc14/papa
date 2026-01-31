import { atom, useAtomValue, useSetAtom } from 'jotai'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { SeoFieldSet } from '~/components/seo-field-set'
import {
	productAtom,
	storeConfigAtom,
} from '~/routes/services/ecommerce/store/product/context'

const productSeoAtom = atom(get => get(productAtom)?.seo ?? null)
const productNameAtom = atom(get => get(productAtom)?.name ?? null)
const productSlugAtom = atom(get => get(productAtom)?.slug ?? null)
const productDescriptionAtom = atom(
	get => get(productAtom)?.description ?? null,
)
const productFeatureImageAtom = atom(
	get => get(productAtom)?.option.image ?? null,
)

export function Seo() {
	const setProduct = useSetAtom(productAtom)
	const storeConfig = useAtomValue(storeConfigAtom)
	const seo = useAtomValue(productSeoAtom)
	const name = useAtomValue(productNameAtom)
	const slug = useAtomValue(productSlugAtom)
	const description = useAtomValue(productDescriptionAtom)
	const featureImage = useAtomValue(productFeatureImageAtom)

	const handleChange = (field: string, value: string) => {
		setProduct(prev => {
			if (!prev) return prev
			return {
				...prev,
				seo: { ...prev.seo, [field]: value },
			}
		})
	}

	if (!seo) return null

	return (
		<Card id="seo">
			<CardHeader>
				<CardTitle>SEO</CardTitle>
				<CardDescription>
					Manage your search engine optimization (SEO) to improve product
					visibility.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<SeoFieldSet
					seo={seo}
					onFillInTitle={() => handleChange('metaTitle', name || '')}
					onTitleChange={title => handleChange('metaTitle', title)}
					onFillInDescription={() =>
						handleChange('metaDescription', description || '')
					}
					onDescriptionChange={desc => handleChange('metaDescription', desc)}
					linkPreview={`${import.meta.env.VITE_BASE_URL} › ${storeConfig.storeFrontPath.slice(1)} › product › ${slug}`}
					onFillInOgImage={() => handleChange('ogImage', featureImage || '')}
					onOgImageChange={({ src }) => handleChange('ogImage', src)}
					onKeywordsChange={keywords => handleChange('keywords', keywords)}
				/>
			</CardContent>
		</Card>
	)
}
