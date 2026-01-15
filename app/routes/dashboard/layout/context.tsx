import { createContext, useContext, useState } from 'react'

export type NavMetadata = {
	showGlobalLoader: boolean
}

const NavigationContext = createContext({
	navMetadata: { showGlobalLoader: true },
	setNavMetadata: (m: NavMetadata) => {},
})

export function NavigationProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [navMetadata, setNavMetadata] = useState<NavMetadata>({
		showGlobalLoader: true,
	})

	return (
		<NavigationContext.Provider value={{ navMetadata, setNavMetadata }}>
			{children}
		</NavigationContext.Provider>
	)
}

export function useNavigationMetadata() {
	return useContext(NavigationContext)
}
