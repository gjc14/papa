/**
 * Contains the SEO part of the post editor.
 * It includes the SEO title and SEO description fields.
 */
import { useAtom } from 'jotai'
import { toast } from 'sonner'

import { Spinner } from '~/components/ui/spinner'
import { SeoFieldSet } from '~/components/seo-field-set'
import { generateSeoDescription } from '~/lib/utils/seo'

import { editorAtom, postAtom } from '../../context'

export const SeoPart = () => {
	const [post, setPost] = useAtom(postAtom)
	const [editor] = useAtom(editorAtom)

	if (!editor || !post) return <Spinner />

	const handleChange = (field: string, value: string) => {
		setPost(prev => {
			if (!prev) return prev
			return {
				...prev,
				seo: {
					...prev.seo,
					[field]: value,
				},
			}
		})
	}

	const handleFillInDescription = () => {
		const text = editor.getText() || ''
		if (!text) {
			toast.error('No content to generate SEO description')
			return
		}
		handleChange('metaDescription', generateSeoDescription(text))
	}

	return (
		<SeoFieldSet
			seo={post.seo}
			onFillInTitle={() => handleChange('metaTitle', post.title)}
			onTitleChange={title => handleChange('metaTitle', title)}
			onFillInDescription={handleFillInDescription}
			onDescriptionChange={desc => handleChange('metaDescription', desc)}
			onFillInOgImage={() => handleChange('ogImage', post.featuredImage || '')}
			onOgImageChange={({ src }) => handleChange('ogImage', src)}
			onKeywordsChange={keywords => handleChange('keywords', keywords)}
		/>
	)
}
