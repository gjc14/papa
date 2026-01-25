import { atom } from 'jotai'

import { getAllServiceDashboards } from '~/lib/service/dashboard'
import { DEFAULT_SERVICE } from '~/lib/service/data'
import type { ServiceDashboard } from '~/lib/service/type'

export type DashboardContextData = {
	navigation: NavigationConfig
	services: ServiceDashboards
}

////////////////////
// child contexts //
////////////////////
export type NavigationConfig = {
	showGlobalLoader: boolean
}

export type ServiceDashboards = ServiceDashboard[]

export const dashboardContextAtom = atom<DashboardContextData>({
	navigation: { showGlobalLoader: true },
	services: [DEFAULT_SERVICE, ...getAllServiceDashboards()],
})
