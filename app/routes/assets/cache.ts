export type MetadataCache = {
	key: string
	public: number | null
	ownerId: string | null
}

// In-memory cache for asset metadata
// This cache persists across module reloads during development
export const metadataCache = new Map<string, MetadataCache | null>()
