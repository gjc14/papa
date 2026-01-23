import type { Service } from './type'

/**
 * Dynamically import all service routes
 * This uses Vite's import.meta.glob to automatically discover all routes.ts files
 * in service directories and import them at build time
 */
export const getServiceRoutesModules = () => {
	// This will be resolved at build time by Vite
	const modules = import.meta.glob('../../../routes/services/*/config.tsx', {
		eager: true, // Ensure we load the modules at build time
		import: 'config', // Import the named export 'config'
	}) as Record<string, Service>

	// Filter out undefined modules (files that don't have proper config export)
	const validModules: Record<string, Service> = {}

	for (const [path, module] of Object.entries(modules)) {
		if (module !== undefined && module !== null) {
			validModules[path] = module
		} else {
			console.warn(
				`Skipping invalid service config at ${path}: config export is undefined`,
			)
		}
	}

	return validModules
}
