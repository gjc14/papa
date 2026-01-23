import type { ServiceRoutesModule } from './type'

const ServiceRouteModules: ServiceRoutesModule[] = []

export const registerServiceRoutes = (m: ServiceRoutesModule) => {
	ServiceRouteModules.push(m)
}

export const getServiceRouteModules = () => ServiceRouteModules
