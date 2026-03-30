/**
 * Convert specified key names' types to Date.
 */
type ConvertToDate<T, K extends string> = T extends (infer U)[]
	? ConvertToDate<U, K>[] // handle arrays
	: T extends Record<string, unknown>
		? {
				[P in keyof T]: P extends K
					? Date // if the key matches, change the type to Date
					: ConvertToDate<T[P], K> // otherwise recurse
			}
		: T // primitive types remain unchanged

/**
 * Union-type version: supports multiple date fields.
 */
type ConvertDateFields<
	T,
	K extends string = "createdAt" | "updatedAt" | "deletedAt" | "publishedAt",
> = ConvertToDate<T, K>

/**
 * Converts specified string fields to Date objects recursively.
 * @param obj Object to process
 * @param dateFields Array of field names that should be converted to Date objects
 * @returns Object with specified fields converted to Date objects
 */
export function convertDateFields<
	T,
	K extends string = "createdAt" | "updatedAt" | "deletedAt" | "publishedAt",
>(obj: T, dateFields?: K[]): ConvertDateFields<T, K> {
	const fieldsToConvert =
		dateFields ??
		(["createdAt", "updatedAt", "deletedAt", "publishedAt"] as K[])

	if (obj === null || typeof obj !== "object") {
		return obj as ConvertDateFields<T, K>
	}

	if (Array.isArray(obj)) {
		return obj.map((item) =>
			convertDateFields(item, fieldsToConvert),
		) as ConvertDateFields<T, K>
	}

	const result: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(obj)) {
		if (
			fieldsToConvert.includes(key as K) &&
			value !== null &&
			value !== undefined
		) {
			// Convert to Date if it's a date field and value exists
			try {
				result[key] = new Date(value as string | number)
			} catch {
				// If conversion fails, still create Date object (might be Invalid Date)
				console.warn(`Failed to convert ${key} to Date:`, value)
				result[key] = new Date(value as string | number)
			}
		} else if (value !== null && typeof value === "object") {
			// Recursively process nested objects
			result[key] = convertDateFields(value, fieldsToConvert)
		} else {
			// Keep original value
			result[key] = value
		}
	}

	return result as ConvertDateFields<T, K>
}
