import type { Seo } from '~/lib/db/schema'

// Counter to ensure unique slugs when generating fallbacks
let slugCounter = 0

/**
 * Generate a URL-safe slug from a string with multi-language support
 * @param name - The input string to convert to a slug
 * @param options - Optional configuration
 * @returns A URL-safe slug string
 */
export const generateSlug = (
	name: string,
	options: {
		maxLength?: number
		fallbackPrefix?: string
		preserveUnicode?: boolean
		prevent?: string[]
	} = {},
) => {
	const {
		maxLength = 50,
		fallbackPrefix = 'item',
		preserveUnicode = true,
	} = options

	if (!name || typeof name !== 'string') {
		return generateFallbackSlug(fallbackPrefix)
	}

	// Trim whitespace
	let slug = name.trim()

	if (preserveUnicode) {
		// For multi-language support, convert to lowercase and handle Unicode characters
		slug = slug
			.toLowerCase()
			// Replace spaces and CJK ideographic space with hyphens
			.replace(/[\s\u3000]+/g, '-') // \u3000 is CJK ideographic space
			// Replace common CJK punctuation with hyphens for better URL readability
			.replace(/[，。！？；：""''（）【】「」『』〈〉《》、]/g, '-')
			// Remove or replace other problematic characters but keep Unicode letters/numbers
			.replace(/[^\p{L}\p{N}\-_.~]/gu, '-')
			// Handle multiple consecutive hyphens
			.replace(/-+/g, '-')
			// Remove leading/trailing hyphens
			.replace(/^-+|-+$/g, '')
	} else {
		// Only ASCII characters
		slug = slug
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	// Truncate if too long
	if (slug.length > maxLength) {
		slug = slug.substring(0, maxLength).replace(/-+$/, '')
	}

	// If slug is empty or too short after processing, generate fallback
	if (!slug || slug.length < 1) {
		return generateFallbackSlug(fallbackPrefix)
	}

	if (options.prevent && options.prevent.includes(slug)) {
		slug = slug + '-' + getRandomAnimal()
	}

	return slug
}

function getRandomAnimal() {
	const animals = ['cat', 'dog', 'elephant', 'giraffe', 'penguin']
	const randomIndex = Math.floor(Math.random() * animals.length)
	return animals[randomIndex]
}

/**
 * Generate a unique fallback slug
 * @param prefix - Prefix for the fallback slug
 * @returns A unique fallback slug
 */
const generateFallbackSlug = (prefix: string = 'item'): string => {
	const timestamp = Date.now()
	const counter = ++slugCounter
	return `${prefix}-${timestamp}-${counter}`
}

export const createMeta = (seo: Seo, url: URL) => {
	const metaTags = []

	// Title
	if (seo.metaTitle) {
		metaTags.push({ title: seo.metaTitle })
	}

	// Description
	if (seo.metaDescription) {
		metaTags.push({ name: 'description', content: seo.metaDescription })
	}

	// Keywords
	if (seo.keywords) {
		metaTags.push({ name: 'keywords', content: seo.keywords })
	}

	// Open Graph tags
	if (seo.metaTitle) {
		metaTags.push({ property: 'og:title', content: seo.metaTitle })
	}

	if (seo.metaDescription) {
		metaTags.push({
			property: 'og:description',
			content: seo.metaDescription,
		})
	}

	// Open Graph Image
	if (seo.ogImage) {
		metaTags.push({ property: 'og:image', content: seo.ogImage })
	}

	// Other Open Graph tags
	metaTags.push({ property: 'og:type', content: 'website' })

	// Current URL
	metaTags.push({
		property: 'og:url',
		content: url.href,
	})

	// Twitter Card
	metaTags.push({ name: 'twitter:card', content: 'summary_large_image' })

	if (seo.metaTitle) {
		metaTags.push({ name: 'twitter:title', content: seo.metaTitle })
	}

	if (seo.metaDescription) {
		metaTags.push({
			name: 'twitter:description',
			content: seo.metaDescription,
		})
	}

	if (seo.ogImage) {
		metaTags.push({ name: 'twitter:image', content: seo.ogImage })
	}

	return { metaTags, seo }
}

/**
 * Generate an SEO-optimized description from a paragraph.
 * @param paragraph - The paragraph to be summarized.
 * @param options - Customization options.
 * @returns SEO description.
 * @example generateSeoDescription(myParagraph)
 */
export function generateSeoDescription(
	paragraph: string,
	options: {
		maxLength?: number
		keywordEmphasis?: boolean
		detectLanguage?: boolean
	} = {},
): string {
	// Set default options
	const defaultOptions = {
		maxLength: 160,
		keywordEmphasis: true,
		detectLanguage: true,
	}
	const settings = { ...defaultOptions, ...options }

	// Detect language and adjust the maxLength accordingly
	if (settings.detectLanguage) {
		const hasCJK =
			/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(
				paragraph,
			)
		if (hasCJK) {
			settings.maxLength = Math.min(settings.maxLength, 100) // Limit CJK languages to 100 characters
		}
	}

	// Remove any HTML or markdown tags
	const cleanText = paragraph.replace(/<[^>]*>|\*\*([^*]*)\*\*/g, '$1')

	// Split the paragraph into sentences.
	// Consider multiple punctuation marks, especially for CJK languages.
	const sentences = cleanText
		.replace(/([.!?。！？…\n])\s*/g, '$1|')
		.split('|')
		.filter(s => s.trim().length > 0)

	// Construct the description by adding sentences until near the maxLength limit.
	let description = ''
	let i = 0
	while (
		i < sentences.length &&
		description.length + sentences[i].length < settings.maxLength - 3
	) {
		description += sentences[i] + ' '
		i++
	}

	// If no sentences were added, means the first sentence is too long.
	// Use the first sentence and split it as a fallback.
	if (!description && sentences.length > 0) {
		description = sentences[0].substring(0, settings.maxLength - 3)
	}

	// Trim the description and ensure it doesn't cut off mid-word.
	if (description.length > settings.maxLength) {
		description = description.substring(0, settings.maxLength - 3)

		// Find the last space to avoid cutting a word in half.
		// For CJK languages, this might not always be necessary, but it's useful for mixed texts.
		const lastSpace = description.lastIndexOf(' ')
		if (lastSpace > settings.maxLength * 0.7) {
			description = description.substring(0, lastSpace)
		}

		description += '...'
	}

	// Clean up extra spaces and trim the description.
	description = description.replace(/\s+/g, ' ').trim()

	// Extract potential keywords (nouns, named entities, etc.)
	const keywords = extractKeywords(cleanText)

	// Optionally emphasize keywords in the description.
	if (settings.keywordEmphasis && keywords.length > 0) {
		keywords.forEach(keyword => {
			// Check if the keyword exists in the description (case-insensitive)
			if (description.toLowerCase().includes(keyword.toLowerCase())) {
				// Use word boundary regex to ensure we're not matching a substring of a larger word.
				const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi')
				// Here, you could wrap the keyword with a tag for emphasis, e.g.,:
				// description = description.replace(regex, `<strong>${keyword}</strong>`);
				// For now, we'll simply reassign the keyword (this line can be modified as needed).
				description = description.replace(regex, keyword)
			}
		})
	}

	return description
}

/**
 * Extract potential keywords from the text.
 * @param text - The text to analyze.
 * @returns An array of potential keywords.
 */
export function extractKeywords(text: string): string[] {
	// Detect if the text contains CJK characters.
	const hasCJK =
		/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(
			text,
		)

	let words: string[] = []

	if (hasCJK) {
		// Simple segmentation for CJK languages.
		// In production, consider using a professional NLP library.
		const segmented = text
			.replace(/[，。！？；：""''（）【】「」『』〈〉《》、]/g, ' ')
			.split(/\s+/)
			.filter(word => word.length >= 2)
		words = segmented
	} else {
		// Tokenization for Western languages.
		const smallWords = new Set([
			'a',
			'an',
			'the',
			'and',
			'or',
			'but',
			'in',
			'on',
			'at',
			'to',
			'for',
			'with',
			'by',
			'of',
		])
		words = text
			.split(/\s+/)
			.map(word => word.replace(/[,.()[\]{}:;'"]/g, ''))
			.filter(word => word.length > 2 && !smallWords.has(word.toLowerCase()))
	}

	// Calculate word frequency.
	const wordCount: Record<string, number> = {}
	words.forEach(word => {
		const lower = word.toLowerCase()
		wordCount[lower] = (wordCount[lower] || 0) + 1
	})

	// Get frequent words (appearing more than once).
	const frequentWords = Object.keys(wordCount)
		.filter(word => wordCount[word] > 1)
		.sort((a, b) => wordCount[b] - wordCount[a])

	// If no frequent words, return the longest few words.
	if (frequentWords.length === 0) {
		return words.sort((a, b) => b.length - a.length).slice(0, 5)
	}

	// Return the top 5 keywords.
	return frequentWords.slice(0, 5)
}

/**
 * Escape special characters for a regular expression.
 * @param string - The string to escape.
 * @returns The escaped string.
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Example usage
 */
// English example
const englishParagraph = `Donald Trump's sweeping tariffs have shaken global trade, but disruption often creates opportunity. Starting 9 April, Indian goods will face tariffs of up to 27% (Trump's tariff chart lists India's rate as 26%, but the official order says 27% - a discrepancy seen for other nations too). Before the tariff hike, US rates across trading partners averaged 3.3%, among the lowest globally, compared to India's 17%, according to the White House.`

// Chinese Mandarin example
const chineseParagraph = `頁面上的內容不能詞不達意，需要滿足訪客關鍵字想要看到的內容。如關鍵字搜尋 珍珠奶茶，你要寫的內容應該就要包括 國內各縣市珍珠奶茶的評測文章、烹煮方式、原料好壞等，訪客有可能會想知道的內容。這些主題不一定要全部都濃縮在同一個頁面內，但一定要互相連結。`

// Japanese example
const japaneseParagraph = `トランプ大統領は2日、ホワイトハウスで演説し、「まもなく世界中の国々に対して相互関税を導入する歴史的な大統領令に署名する。つまり、相手がわれわれに対して行うことはわれわれも相手に対して行うということだ。非常に単純な話だ。これほど単純なことはない」と述べ、貿易相手国の関税率や非関税障壁を踏まえて自国の関税を引き上げる「相互関税」を導入する考えを明らかにしました。`
