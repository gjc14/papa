import type { ServiceDashboard } from './type'

const Dashboards: ServiceDashboard[] = []

export const registerServiceDashboard = (d: ServiceDashboard) => {
	Dashboards.push(d)
}

export const getServiceDashboards = () => Dashboards
