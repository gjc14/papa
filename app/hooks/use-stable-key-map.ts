import { useRef } from "react"
import { nanoid } from "nanoid"

type StableKeyItem<T> = {
	item: T
	key: string
}

/**
 * Keeps a stable UI key for each item identity across renders.
 *
 * @example
 * const tagsWithKey = useStableKeyMap(tags, (tag) =>
 *   tag.name,
 * )
 *
 * return tagsWithKey.map(({ item, key }) =>
 *   item.title ? <title key={key}>{item.title}</title> : <meta key={key} {...item} />,
 * )
 */
export function useStableKeyMap<T>(
	items: readonly T[] | null | undefined,
	getIdentity: (item: T) => string,
): Array<StableKeyItem<T>> {
	const keyMapRef = useRef(new Map<string, string[]>())

	if (!items || items.length === 0) {
		return []
	}

	const seenInRender = new Map<string, number>()

	return items.map((item) => {
		const identity = getIdentity(item)
		// e.g., ["A", "A", "B"].
		// occurrence for A becomes 0 on first A, then 1 on second A.
		const occurrence = seenInRender.get(identity) ?? 0
		seenInRender.set(identity, occurrence + 1)

		// e.g., keyMapRef stores A -> ["key1", "key2"], B -> ["key3"].
		// So A at occurrence 0 gets key1, A at occurrence 1 gets key2.
		const identityKeys = keyMapRef.current.get(identity) ?? []

		if (!identityKeys[occurrence]) {
			identityKeys[occurrence] = nanoid()
			keyMapRef.current.set(identity, identityKeys)
		}

		const key = identityKeys[occurrence]

		return {
			item,
			key,
		}
	})
}
