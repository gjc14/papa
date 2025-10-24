/**
 * Proxy requests to the presigned URL of the asset
 */
import { type LoaderFunctionArgs } from 'react-router'

import { auth } from '~/lib/auth/auth.server'
import { db } from '~/lib/db/db.server'

import { metadataCache, type MetadataCache } from './cache'
import { isValidUUID, presignedUrlRes } from './helpers'

// Usage: example.com/assets/{assetId}
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const assetId = params.assetId

	if (!assetId) {
		console.log(`Asset ${assetId} not found`)
		throw new Response('Invalid arguments', {
			status: 400,
			statusText: 'Invalid arguments',
		})
	}

	// Validate UUID format before database query
	if (!isValidUUID(assetId)) {
		console.log(`Invalid UUID format: ${assetId}`)
		throw new Response('Invalid arguments', {
			status: 400,
			statusText: 'Invalid arguments',
		})
	}

	let metadata: MetadataCache | null = null

	console.time(`Fetching asset ${assetId}`)

	// Check if metadata is cached
	if (metadataCache.has(assetId)) {
		console.log(`asset ${assetId} from cache`)
		metadata = metadataCache.get(assetId) || null
	} else {
		console.log(`asset ${assetId} from database`)
		metadata =
			(await db.query.file.findFirst({
				where: (t, { eq, and }) => and(eq(t.id, assetId)),
				columns: {
					key: true,
					public: true,
					ownerId: true,
				},
			})) || null

		// Cache the metadata
		metadataCache.set(assetId, metadata)
	}

	console.timeEnd(`Fetching asset ${assetId}`)

	if (!metadata)
		throw new Response('asset not found', {
			status: 404,
			statusText: 'Asset not found',
		})

	if (!metadata.public) {
		// TODO: check ACL (access control) here
		const session = await auth.api.getSession(request)
		if (metadata.ownerId !== session?.user.id) {
			throw new Response('', { status: 401 })
		}
	}

	return presignedUrlRes(metadata.key)
}

// This route is a proxy for the asset's presigned URL.
// Should not render any UI or error boundary.
// export default function AssetRoute() {}
