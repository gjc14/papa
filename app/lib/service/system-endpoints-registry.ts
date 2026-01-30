import type { ServiceSystemEndpoints } from './type'

const SystemEndpoints: ServiceSystemEndpoints[] = []

export const registerSystemEndpoints = (se: ServiceSystemEndpoints) => {
	SystemEndpoints.push(se)
}

export const getSystemEndpoints = () => SystemEndpoints
