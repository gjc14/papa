import type {
	ColumnFiltersState,
	GlobalFilterTableState,
	PaginationState,
	SortingState,
} from "@tanstack/react-table"

import {
	DEFAULT_TABLE_SEARCH_PARAMS_CONFIG,
	type TableSearchParamsConfig,
} from "./hooks"

export function safeJsonParse<T>(value: string | null, fallback: T): T {
	if (!value) return fallback
	try {
		return JSON.parse(value) as T
	} catch {
		return fallback
	}
}

export function getNumber(
	params: URLSearchParams,
	key: string,
	fallback: number,
): number {
	const raw = params.get(key)
	if (raw === null) return fallback
	const num = Number(raw)
	return Number.isNaN(num) ? fallback : num
}

type ParsedTableSearchParams = {
	pagination: PaginationState
	sorting: SortingState
	columnFilters: ColumnFiltersState
	globalFilter: GlobalFilterTableState["globalFilter"]
}

/**
 * Parses table state (pagination, sorting, filters) from URL search parameters
 * for server-side usage in loaders or actions.
 *
 * @param request - The Request object from React Router loader/action
 * @param config - Optional config to override query parameter names and defaults
 *
 * @returns Parsed table state ready to use in server-side queries
 *
 * @example
 * ```ts
 * // In your loader
 * export const loader = async ({ request }: Route.LoaderArgs) => {
 *   const tableState = parseTableSearchParams(request)
 *   const data = await getData(tableState)
 *   return { data }
 * }
 * ```
 *
 * @example
 * ```ts
 * // With custom config
 * const tableState = parseTableSearchParams(request, {
 *   pageIndexParam: 'p',
 *   pageSize: 25, // Default to 25 rows per page
 * })
 * ```
 */
export function parseTableSearchParams(
	request: Request | URL | URLSearchParams,
	overrides?: Partial<TableSearchParamsConfig>,
): ParsedTableSearchParams {
	const config: TableSearchParamsConfig = {
		...DEFAULT_TABLE_SEARCH_PARAMS_CONFIG,
		...overrides,
	}

	let searchParams: URLSearchParams

	if (request instanceof Request) {
		const url = new URL(request.url)
		searchParams = url.searchParams
	} else if (request instanceof URL) {
		searchParams = request.searchParams
	} else {
		searchParams = request
	}

	return {
		pagination: {
			pageIndex:
				getNumber(searchParams, config.pageIndexParam, config.pageIndex + 1) -
				1,
			pageSize: getNumber(searchParams, config.pageSizeParam, config.pageSize),
		},
		sorting: safeJsonParse<SortingState>(
			searchParams.get(config.sortingParam),
			[],
		),
		columnFilters: safeJsonParse<ColumnFiltersState>(
			searchParams.get(config.columnFiltersParam),
			[],
		),
		globalFilter: searchParams.get(config.globalFilterParam) ?? "",
	}
}
