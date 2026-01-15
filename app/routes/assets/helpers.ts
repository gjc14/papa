import { getFileUrl } from '~/lib/db/asset.server'

export const presignedUrlRes = async (key: string) => {
	const presignedUrl = await getFileUrl(key)

	if (!presignedUrl) {
		console.error('Error when getting presigned URL')
		throw new Response('', {
			status: 500,
		})
	}

	/**
	 * This will fetch the presigned URL and return the response
	 * `fetch` will automatically decode the response body,
	 * so when I return the response, it does not have the correct headers.
	 * That means when header `content-encoding` is set to `gzip` or `br`,
	 * the browser will try to decode the response body, but it will fail
	 * with an error like `net::ERR_CONTENT_DECODING_FAILED 200 (OK)`, because
	 * the response body is already decoded by `fetch`.
	 */
	const response = await fetch(presignedUrl)
	if (response.status !== 200) {
		console.error(
			'Error when fetching presigned URL:',
			presignedUrl,
			response.status,
			response.statusText,
		)

		throw new Response('', {
			status: response.status,
			statusText: response.statusText,
		})
	}

	// Clone the response to avoid conflicts and filter out problematic headers
	const responseClone = response.clone()
	const headers = new Headers()

	// Copy headers but exclude potentially problematic encoding headers
	for (const [key, value] of responseClone.headers.entries()) {
		const lowerKey = key.toLowerCase()
		// Skip encoding-related headers that might cause decoding issues
		if (lowerKey !== 'content-encoding' && lowerKey !== 'transfer-encoding') {
			headers.set(key, value)
		}
	}

	// Create a new response with filtered headers
	return new Response(responseClone.body, {
		status: responseClone.status,
		statusText: responseClone.statusText,
		headers: headers,
	})
}

// UUID validation function
export const isValidUUID = (str: string): boolean => {
	// RFC 4122 compliant UUID regex (more strict - validates version and variant)
	const strictUuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

	// Less strict UUID regex (accepts any valid hex format) from https://ihateregex.io/expr/uuid/
	// const looseUuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

	return strictUuidRegex.test(str)
}
