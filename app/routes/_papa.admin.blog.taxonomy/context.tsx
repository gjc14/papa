import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
} from 'react'

import { useAdminBlogContext } from '~/routes/_papa.admin.blog/route'

type TagType = ReturnType<typeof useAdminBlogContext>['tags'][number]
type CategoryType = ReturnType<typeof useAdminBlogContext>['categories'][number]

interface TaxonomyStateContextType {
    tagsState: TagType[]
    setTagsState: Dispatch<SetStateAction<TagType[]>>
    categoriesState: CategoryType[]
    setCategoriesState: Dispatch<SetStateAction<CategoryType[]>>
}

const TaxonomyStateContext = createContext<TaxonomyStateContextType | null>(
    null
)

// Provider
export function TaxonomyStateProvider({
    value,
    children,
}: {
    value: TaxonomyStateContextType
    children: ReactNode
}) {
    return (
        <TaxonomyStateContext.Provider value={value}>
            {children}
        </TaxonomyStateContext.Provider>
    )
}

// Consumer hook
export function useTaxonomyState() {
    const context = useContext(TaxonomyStateContext)

    if (!context) {
        throw new Error(
            'useTaxonomyState must be used within a TaxonomyStateProvider'
        )
    }

    return context
}
