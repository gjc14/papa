import { randomBytes } from 'node:crypto'
import { unstable_createContext } from 'react-router'

export function generateNonce() {
	return randomBytes(16).toString('base64')
}

export const nonceContext = unstable_createContext<string>()

/**
 * Generates a Content Security Policy (CSP) header with nonce.
 *
 * **Fallbacks**
 * Some fetch directives function as fallbacks for other more granular directives. This means that if the more granular directive is not specified, then the fallback is used to provide a policy for that resource type.

 * - default-src is a fallback for all other fetch directives.
 * - script-src is a fallback for script-src-attr and script-src-elem.
 * - style-src is a fallback for style-src-attr and style-src-elem.
 * - child-src is a fallback for frame-src and worker-src.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy#directives
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
 */
export function getContentSecurityPolicy(nonce: string) {
	return [
		/** Fetch Directives */
		`default-src 'self'`,
		`script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com`,
		`style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
		// `child-src 'none' <source-expression-list>`,
		// `connect-src 'none' <source-expression-list>`,
		`font-src 'self' https://fonts.gstatic.com`,
		// `frame-src 'none' <source-expression-list>`,
		// `img-src 'self' data: https://images.unsplash.com`,
		// `manifest-src 'none' <source-expression-list>`,
		// `media-src 'none' <source-expression-list>`,
		// `object-src 'none' <source-expression-list>`,
		// `worker-src 'none' <source-expression-list>`,

		/** Document Directives */
		// `base-uri 'none' <source-expression-list>`,
		// `sandbox sandbox <value>`,

		/** Navigation Directives */
		// `form-action 'none' <source-expression-list>`,
		// `frame-ancestors 'none' <source-expression-list>`,

		/** Reporting Directives */
		`report-to csp-endpoint`,

		/** Other Directives */
		// `require-trusted-types-for 'script'`,
		// `trusted-types`,
		// `upgrade-insecure-requests`,
	]
		.join('; ')
		.trim()
}
