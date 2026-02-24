import React from 'react'
import { useSearchParams } from 'react-router'

import type {
	ColumnFiltersState,
	GlobalFilterTableState,
	PaginationState,
	SortingState,
	Updater,
} from '@tanstack/react-table'
import { useSetAtom } from 'jotai'

import { dashboardContextAtom } from '~/routes/dashboard/layout/context'

import type { DashboardDataTableProps } from './types'
import { getNumber, parseTableSearchParams, safeJsonParse } from './utils'

/**
 * A hook that returns a tuple of `[shouldSkip, skip]` to control auto-resetting of pagination.
 * @returns [shouldSkip, skip]
 *
 * @example
 * const [shouldSkip, skip] = useSkipper()
 *
 * <DashboardDataTable
 *   autoResetPageIndex={shouldSkip}
 *   skipAutoResetPageIndex={skip}
 * />
 */
function useSkipper() {
	const shouldSkipRef = React.useRef(true)
	const shouldSkip = shouldSkipRef.current

	// Wrap a function with this to skip a pagination reset temporarily
	const skip = React.useCallback(() => {
		shouldSkipRef.current = false
	}, [])

	React.useEffect(() => {
		shouldSkipRef.current = true
	})

	return [shouldSkip, skip] as const
}

type ServerModeProps = NonNullable<DashboardDataTableProps<any, any>['server']>
type StateKeys = 'pagination' | 'sorting' | 'columnFilters' | 'globalFilter'

/** Discriminated union — each member pairs a key with its correct Updater */
type QueryParamUpdate = {
	[K in StateKeys]: {
		key: K
		updater: Updater<NonNullable<ServerModeProps[K]>>
	}
}[StateKeys]

export const DEFAULT_TABLE_SEARCH_PARAMS_CONFIG = {
	pageIndexParam: 'page',
	pageSizeParam: 'pageSize',
	sortingParam: 'sorting',
	columnFiltersParam: 'filter',
	globalFilterParam: 'q',
	pageIndex: 0,
	pageSize: 10,
} as const satisfies TableSearchParamsConfig

export type TableSearchParamsConfig = {
	/** Query parameter name for the page index.
	 * @default 'page' */
	pageIndexParam: string
	/** Query parameter name for the page size.
	 * @default 'pageSize' */
	pageSizeParam: string
	/** Query parameter name for the sorting state (JSON-encoded).
	 * @default 'sorting' */
	sortingParam: string
	/** Query parameter name for column filters (JSON-encoded).
	 * @default 'filter' */
	columnFiltersParam: string
	/** Query parameter name for the global (full-text) filter.
	 * @default 'q' */
	globalFilterParam: string
	/** Default page index (0-based).
	 * @default 0 */
	pageIndex: number
	/** Default page size (number of rows per page).
	 * @default 10 */
	pageSize: number
}

/**
 * Syncs `DashboardDataTable` server-side state (pagination, sorting, filters)
 * with URL search parameters via `useSearchParams`, so every table view is
 * shareable / bookmarkable.
 *
 * - Default query-param values (`pageIndex = 0`, `pageSize = 10`, empty
 *   sorting / filters) are **removed** from the URL to keep it clean.
 * - Partial config is accepted — unspecified keys fall back to sensible
 *   defaults (see {@link DEFAULT_TABLE_SEARCH_PARAMS_CONFIG}).
 * - Automatically suppresses the global navigation loader while the table
 *   state is being updated.
 *
 * @param config - Override query-parameter names and default pagination values.
 * Defaults:
 * | Key                  | Default     | Description |
 * | -------------------- | ----------- | ----------- |
 * | `pageIndexParam`     | `'page'`    | Query param name for page index |
 * | `pageSizeParam`      | `'pageSize'`| Query param name for page size |
 * | `sortingParam`       | `'sorting'` | Query param name for sorting (JSON) |
 * | `columnFiltersParam` | `'filter'`  | Query param name for filters (JSON) |
 * | `globalFilterParam`  | `'q'`       | Query param name for global search |
 * | `pageIndex`          | `0`         | Default starting page (0-based) |
 * | `pageSize`           | `10`        | Default rows per page |
 *
 * @returns
 * | Field               | Type                                          | Description |
 * | ------------------- | --------------------------------------------- | ----------- |
 * | `pagination`        | `PaginationState`                             | Current `{ pageIndex, pageSize }` derived from the URL. |
 * | `sorting`           | `SortingState`                                | Current sorting descriptors from the URL. |
 * | `columnFilters`     | `ColumnFiltersState`                          | Current per-column filters from the URL. |
 * | `globalFilter`      | `string`                                      | Current global search term from the URL. |
 * | `onQueryParamsChange` | `(update: QueryParamUpdate) => void`        | Call this from `on*Change` handlers to push the new state into the URL. |
 *
 * @example
 * ```tsx
 * // Basic — all defaults
 * const {
 * 	pagination,
 * 	sorting,
 * 	columnFilters,
 * 	globalFilter,
 * 	onQueryParamsChange,
 * } = useTableSearchParams()
 *
 * <DashboardDataTable
 *   server={{
 *     pagination,
 *     sorting,
 *     columnFilters,
 *     globalFilter,
 *     onPaginationChange: v => onQueryParamsChange({ key: 'pagination', updater: v }),
 *     onSortingChange: v => onQueryParamsChange({ key: 'sorting', updater: v }),
 *     onColumnFiltersChange: v => onQueryParamsChange({ key: 'columnFilters', updater: v }),
 *     onGlobalFilterChange: v => onQueryParamsChange({ key: 'globalFilter', updater: v }),
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom parameter names (partial override)
 * const { pagination, onQueryParamsChange } = useTableSearchParams({
 * 	pageIndexParam: 'p',
 * 	globalFilterParam: 'search',
 * })
 * ```
 *
 * @example
 * ```tsx
 * // Custom default pagination values
 * const { pagination, onQueryParamsChange } = useTableSearchParams({
 * 	pageIndex: 0,
 * 	pageSize: 25, // Start with 25 rows per page instead of 10
 * })
 * ```
 */
function useTableSearchParams(overrides?: Partial<TableSearchParamsConfig>) {
	const config: TableSearchParamsConfig = {
		...DEFAULT_TABLE_SEARCH_PARAMS_CONFIG,
		...overrides,
	}

	const setDashboardContext = useSetAtom(dashboardContextAtom)
	const [searchParams, setSearchParams] = useSearchParams()

	function resolve<V>(updater: Updater<V>, current: V): V {
		return updater instanceof Function ? updater(current) : updater
	}

	const onQueryParamsChange = React.useCallback(
		function onQueryParamsChange(update: QueryParamUpdate) {
			/** Prevent global loader */
			setDashboardContext(prev => ({
				...prev,
				navigation: { showGlobalLoader: false },
			}))

			setSearchParams(prev => {
				const next = new URLSearchParams(prev)

				switch (update.key) {
					case 'pagination': {
						const current: PaginationState = {
							pageIndex:
								getNumber(prev, config.pageIndexParam, config.pageIndex + 1) -
								1,
							pageSize: getNumber(prev, config.pageSizeParam, config.pageSize),
						}
						const updated = resolve(update.updater, current)
						updated.pageIndex === config.pageIndex
							? next.delete(config.pageIndexParam)
							: next.set(config.pageIndexParam, String(updated.pageIndex + 1))
						updated.pageSize === config.pageSize
							? next.delete(config.pageSizeParam)
							: next.set(config.pageSizeParam, String(updated.pageSize))
						break
					}
					case 'sorting': {
						const current: SortingState = safeJsonParse(
							prev.get(config.sortingParam),
							[] as SortingState,
						)
						const updated = resolve(update.updater, current)
						updated.length === 0
							? next.delete(config.sortingParam)
							: next.set(config.sortingParam, JSON.stringify(updated))
						break
					}
					case 'columnFilters': {
						const current: ColumnFiltersState = safeJsonParse(
							prev.get(config.columnFiltersParam),
							[] as ColumnFiltersState,
						)
						const updated = resolve(update.updater, current)
						updated.length === 0
							? next.delete(config.columnFiltersParam)
							: next.set(config.columnFiltersParam, JSON.stringify(updated))
						break
					}
					case 'globalFilter': {
						const current: GlobalFilterTableState['globalFilter'] =
							prev.get(config.globalFilterParam) ?? ''
						const updated = resolve(update.updater, current)
						updated
							? next.set(config.globalFilterParam, updated)
							: next.delete(config.globalFilterParam)
						break
					}
				}

				return next
			})
		},
		[config, setDashboardContext, setSearchParams],
	)

	return {
		...parseTableSearchParams(searchParams, config),
		onQueryParamsChange,
	}
}

export { useSkipper, useTableSearchParams }
