import { atom } from 'jotai'

import type { loader } from '~/routes/dashboard/assets/resource'

export const assetsAtom = atom<Awaited<ReturnType<typeof loader>> | null>(null)
