import { atom } from 'jotai'

export type DashboardContextData = {
	navigation: NavigationConfig
}

////////////////////
// child contexts //
////////////////////
export type NavigationConfig = {
	showGlobalLoader: boolean
}

export const dashboardContextAtom = atom<DashboardContextData>({
	navigation: { showGlobalLoader: true },
})
