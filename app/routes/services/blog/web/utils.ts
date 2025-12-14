/**
 * Estimate the reading time for a given text.
 * @param text The text to analyze.
 * @param unitsPerMinute The reading speed in units per minute (default: 300). A "unit" is considered a word in spaced languages or a character in non-spaced languages.
 * @returns The estimated reading time in minutes.
 */
export function estimateReadingTime(
	text: string,
	unitsPerMinute = 300,
): number {
	// Regular expression for characters in languages that are generally not space-separated.
	// Using the RegExp constructor with an array makes it more readable and maintainable.
	// The 'u' flag is essential for handling Unicode characters outside the Basic Multilingual Plane (BMP).
	const nonSpacedLangRegex = new RegExp(
		[
			// CJK Unified Ideographs (Han characters) - Covers Chinese, Japanese Kanji, Korean Hanja
			'[\u4e00-\u9fff]', // Common Unified Ideographs
			'[\u3400-\u4dbf]', // Extension A
			'[\\u{20000}-\\u{2a6df}]', // Extension B
			'[\\u{2a700}-\\u{2b73f}]', // Extension C
			'[\\u{2b740}-\\u{2b81f}]', // Extension D
			'[\\u{2b820}-\\u{2ceaf}]', // Extension E
			'[\\u{2ceb0}-\\u{2ebe0}]', // Extension F
			'[\uf900-\ufaff]', // CJK Compatibility Ideographs
			'[\\u{2f800}-\\u{2fa1f}]', // CJK Compatibility Ideographs Supplement

			// Japanese Kana
			'[\u3040-\u309f]', // Hiragana
			'[\u30a0-\u30ff]', // Katakana

			// Korean Hangul Syllables
			'[\uac00-\ud7af]',

			// Southeast Asian Scripts
			'[\u0e00-\u0e7f]', // Thai
			'[\u0e80-\u0eff]', // Lao
			'[\u1780-\u17ff]', // Khmer
			'[\u1000-\u109f]', // Myanmar (Burmese)

			// Indic Scripts (major ones)
			'[\u0900-\u097f]', // Devanagari (Hindi, Marathi, etc.)
			'[\u0980-\u09ff]', // Bengali
			'[\u0a80-\u0aff]', // Gujarati
			'[\u0b00-\u0b7f]', // Oriya
			'[\u0b80-\u0bff]', // Tamil
			'[\u0c00-\u0c7f]', // Telugu
			'[\u0c80-\u0cff]', // Kannada
			'[\u0d00-\u0d7f]', // Malayalam

			// Right-to-Left (RTL) Scripts
			'[\u0600-\u06ff]', // Arabic
			'[\u0590-\u05ff]', // Hebrew
		].join('|'),
		'gu',
	)

	// Regex to remove common punctuation from all languages to improve accuracy.
	const punctuationRegex =
		/[.,!?;:()[\]{}'"`~—–…“”‘’«»「」『』【】、。，？！；：（）]/g

	// 1. Pre-process text by removing punctuation
	const cleanText = text.replace(punctuationRegex, '')

	// 2. Calculate characters in non-spaced languages
	const nonSpacedMatches = cleanText.match(nonSpacedLangRegex) || []
	const nonSpacedCount = nonSpacedMatches.length

	// 3. Isolate spaced-language parts by replacing non-spaced characters with a space
	const spacedText = cleanText.replace(nonSpacedLangRegex, ' ')

	// 4. Calculate words in spaced languages
	const words = spacedText
		.trim()
		.split(/\s+/)
		.filter(word => word.length > 0).length

	// 5. The total units = number of non-spaced characters + number of words
	const totalUnits = nonSpacedCount + words

	// 6. Calculate, and round up to the nearest minute
	return Math.ceil(totalUnits / unitsPerMinute)
}
