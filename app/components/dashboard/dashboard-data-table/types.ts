import {
	type ColumnDef,
	type ColumnFiltersState,
	type GlobalFilterTableState,
	type OnChangeFn,
	type PaginationState,
	type Row,
	type SortingState,
	type TableOptions,
	type Table as TableType,
} from '@tanstack/react-table'

export interface DashboardDataTableProps<TData, TValue> {
	/** You should not depend on the table state from this ref directly */
	ref?: React.Ref<TableType<TData>>
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	setData: React.Dispatch<React.SetStateAction<TData[]>>
	/**
	 * Providing stable id reference
	 * @see https://tanstack.com/table/v8/docs/api/core/instance#getrowid
	 *
	 * This makes sure that when sourece data changes, references also changes. If not provided, index is used.
	 * @example
	 * *In cases when you use state `const [rowState, setRowState] = useState(row.original)`, the component will not rerender when source data changes because the component references the old row index.*
	 * > Important concept: when referencing row with index (when getRowId is not provided),
	 * > the reference is not stable because when source data changes, row will reference the same index but different data.
	 * > In this case, you should call row.original again to get new row, or provide getRowId to rerender row when source data changes.
	 * ```
	 * const data = [
	 * 	{ id: 1, name: "Taylor" }, // index 1
	 * 	{ id: 2, name: "Antonial" } // index 2
	 * ]
	 * ```
	 *
	 * after update, it becomes:
	 *
	 * ```
	 * const newData = [
	 * 	{ id: 2, name: "Antonio" }, // old index 2; now index 1
	 * 	{ id: 1, name: "Taylor"} // old index 1; now index 2
	 * ]
	 *
	 * cell: ({row}) => {
	 * 	// currentRow references new row data, and will update when source data changes
	 * 	const currentRow = row.original
	 *
	 * 	// rowState references old row data, and will not update when source data changes
	 * 	const [rowState, setRowState] = useState(row.original)
	 * 	// to fix this, you can either call row.original again to get new row data, or provide getRowId to make sure it updates as the source data changes
	 *
	 * 	// this will update rowState when source data changes
	 * 	useEffect(() => setRowState(row.original), [row.original])
	 *
	 * 	return rowState.name
	 * }
	 * ```
	 *
	 * If no `getRowId()` provided, table renders seems right (cause rows render the Array directly),
	 * but since row index does not change, it will not rerender the component that references `row.original`.
	 * Thus you need to call `row.original` again to get current new row data, or provide `getRowId()` to make sure it updates as the source data changes.
	 * Otherwise, your `row.original` will still reference the old data.
	 */
	getRowId?:
		| ((
				originalRow: TData,
				index: number,
				parent?: Row<TData> | undefined,
		  ) => string)
		| undefined
	/**
	 * Turn on manual mode. You should handle pagination, sorting and filtering on your own when using this.
	 *
	 * If only tens of thousands of rows, you can take advantage of client side table features.
	 * @link [Should You Use Client-Side Pagination?](https://tanstack.com/table/v8/docs/guide/pagination#should-you-use-client-side-pagination)
	 */
	server?: {
		rowCount?: TableOptions<TData>['rowCount']
		pageCount?: TableOptions<TData>['pageCount']

		/** External pagination state. Falls back to internal state when omitted. */
		pagination?: PaginationState
		/** External sorting state. Falls back to `undefined` when omitted. */
		sorting?: SortingState
		/** External column filters state. Falls back to `undefined` when omitted. */
		columnFilters?: ColumnFiltersState
		/** External global filter value. Falls back to `undefined` when omitted. */
		globalFilter?: GlobalFilterTableState['globalFilter']

		onPaginationChange?: OnChangeFn<PaginationState>
		onSortingChange?: OnChangeFn<SortingState>
		onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
		onGlobalFilterChange?: OnChangeFn<GlobalFilterTableState['globalFilter']>
	}

	/**
	 * if true, default column will render an input in the cell.
	 * @default false
	 */
	editable?: boolean

	/**
	 * if true, a select column will be shown on the left.
	 * @default false
	 */
	selectable?: boolean

	/**
	 * - Enables/disables row selection for all rows in the table OR
	 * - A function that given a row, returns whether to enable/disable row selection for that row
	 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/row-selection#enablerowselection)
	 * @link [Guide](https://tanstack.com/table/v8/docs/guide/row-selection)
	 */
	enableRowSelection?: boolean | ((row: Row<TData>) => boolean)

	/**
	 * If provided, allows you to override the default behavior of determining whether a row can be expanded.
	 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/expanding#getrowcanexpand)
	 * @link [Guide](https://tanstack.com/table/v8/docs/guide/expanding)
	 *
	 * @see https://tanstack.com/table/latest/docs/framework/react/examples/expanding
	 */
	getRowCanExpand?: (row: Row<TData>) => boolean

	/**
	 * Function to render an expanded row
	 */
	expandedRowRender?: (
		row: Row<TData>,
		table: TableType<TData>,
	) => React.ReactNode

	/** @default "{ pageIndex: 0, pageSize: 10 }" */
	initialPagination?: Partial<PaginationState>
	/** Determine if page index should reset, value returned from [useSkipper](./hooks.ts) */
	autoResetPageIndex?: boolean
	/** @see https://tanstack.com/table/v8/docs/framework/react/examples/editable-data */
	skipAutoResetPageIndex?: () => void

	/**
	 * The filter function to use for global filtering.
	 * - A `string` referencing a built-in filter function
	 * - A `string` that references a custom filter functions provided via the `tableOptions.filterFns` option
	 * - A custom filter function
	 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/global-filtering#globalfilterfn)
	 * @link [Guide](https://tanstack.com/table/v8/docs/guide/global-filtering)
	 */
	globalFilterFn?: TableOptions<TData>['globalFilterFn']

	className?: string
}
