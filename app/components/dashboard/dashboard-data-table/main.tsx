import React from 'react'

import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type PaginationState,
	type RowData,
	type SortingState,
} from '@tanstack/react-table'
import { ArrowUp, ChevronLeft, ChevronsLeft, Maximize } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'

import { EditableCell } from './components/editable-cell'
import { useSkipper } from './hooks'
import type { DashboardDataTableProps } from './types'

declare module '@tanstack/react-table' {
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: unknown) => void
	}
}

// Give our default column cell renderer editing superpowers!
function createDefaultColumn<TData>(
	editable: boolean,
	server: boolean = false,
): Partial<ColumnDef<TData, unknown>> {
	return {
		cell(ctx) {
			const initialValue = ctx.getValue()

			if (!editable) {
				const displayValue =
					typeof initialValue === 'object' && initialValue !== null ? (
						Array.isArray(initialValue) ? (
							<div className="flex items-center gap-1">
								{initialValue.map((v, i) => (
									<Badge key={i}>{v}</Badge>
								))}
							</div>
						) : (
							<Popover>
								<PopoverTrigger
									render={
										<Button
											variant={'ghost'}
											size={'icon'}
											className="text-muted-foreground size-6"
										>
											<Maximize className="size-3.5" />
										</Button>
									}
								/>
								<PopoverContent>
									<pre className="text-sm whitespace-pre-wrap">
										{JSON.stringify(initialValue, null, 2)}
									</pre>
								</PopoverContent>
							</Popover>
						)
					) : (
						(initialValue as React.ReactNode)
					)
				return (
					<div className="flex h-12 items-center text-sm">{displayValue}</div>
				)
			}

			return EditableCell(ctx)
		},
	}
}

export function DashboardDataTable<TData extends RowData, TValue>({
	ref,
	columns,
	data,
	setData,
	getRowId,
	server,
	editable = false,
	selectable = false,
	enableRowSelection,
	getRowCanExpand,
	expandedRowRender = () => null,
	defaultPagination,
	autoResetPageIndex,
	skipAutoResetPageIndex,
	globalFilterFn,
	className,
}: DashboardDataTableProps<TData, TValue>) {
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
		...defaultPagination,
	})
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)
	const [globalFilter, setGlobalFilter] = React.useState<any>('')

	const [rowSelection, setRowSelection] = React.useState({})

	const [internalAutoResetPageIndex, internalSkipAutoResetPageIndex] =
		useSkipper()

	const selectColumn = React.useMemo(() => createSelectColumn<TData>(), [])
	const defaultColumn = React.useMemo(
		() => createDefaultColumn<TData>(editable, !!server),
		[editable, server],
	)

	const table = useReactTable<TData>({
		defaultColumn,
		columns: [...(selectable ? [selectColumn] : []), ...columns],
		data,
		getCoreRowModel: getCoreRowModel(),
		getRowId,

		enableRowSelection,

		// –– pagination ––––––––––––––––––––––––––––––––––––––––––––––––––––––
		/** @see https://tanstack.com/table/latest/docs/guide/pagination#manual-server-side-pagination */
		manualPagination: !!server,
		getPaginationRowModel: !server ? getPaginationRowModel() : undefined, // not needed for manual server-side pagination
		/** @see https://tanstack.com/table/v8/docs/guide/pagination#page-count-and-row-count */
		rowCount: server?.rowCount,
		pageCount: server?.pageCount,
		/** @see https://tanstack.com/table/v8/docs/guide/pagination#auto-reset-page-index */
		autoResetPageIndex: autoResetPageIndex ?? internalAutoResetPageIndex,

		// –– sorting –––––––––––––––––––––––––––––––––––––––––––––––––––––––––
		/** @see https://tanstack.com/table/v8/docs/guide/sorting#manual-server-side-sorting */
		manualSorting: !!server,
		getSortedRowModel: !server ? getSortedRowModel() : undefined, // not needed for manual server-side sorting

		// –– filtering –––––––––––––––––––––––––––––––––––––––––––––––––––––––
		manualFiltering: !!server,
		/** @see https://tanstack.com/table/v8/docs/guide/column-filtering#manual-server-side-filtering */
		getFilteredRowModel: !server ? getFilteredRowModel() : undefined, // not needed for manual server-side filtering
		/** @see https://tanstack.com/table/latest/docs/guide/global-filtering */
		globalFilterFn: !server ? globalFilterFn : undefined, // not needed for manual server-side filtering

		// –– expanding –––––––––––––––––––––––––––––––––––––––––––––––––––––––
		/** @see https://tanstack.com/table/latest/docs/guide/expanding#enable-client-side-expanding */
		getExpandedRowModel: getExpandedRowModel(),
		/** @see https://tanstack.com/table/latest/docs/framework/react/examples/expanding */
		getRowCanExpand,

		state: {
			/** @see https://tanstack.com/table/v8/docs/guide/row-selection#access-row-selection-state */
			rowSelection,

			pagination: server?.pagination ?? pagination,
			sorting: server?.sorting ?? sorting,
			columnFilters: server?.columnFilters ?? columnFilters,
			globalFilter: server?.globalFilter ?? globalFilter,
		},
		onRowSelectionChange: setRowSelection,

		onPaginationChange: server?.onPaginationChange ?? setPagination,
		onSortingChange: server?.onSortingChange ?? setSorting,
		onColumnFiltersChange: server?.onColumnFiltersChange ?? setColumnFilters,
		onGlobalFilterChange: server?.onGlobalFilterChange ?? setGlobalFilter,

		// Provide our updateData function to our table meta
		meta: {
			updateData: (rowIndex, columnId, value) => {
				/** Skip page index reset until after next rerender @see https://tanstack.com/table/v8/docs/framework/react/examples/editable-data */
				;(skipAutoResetPageIndex ?? internalSkipAutoResetPageIndex)()
				setData(prev =>
					prev.map((row, index) => {
						if (index === rowIndex) {
							return {
								...prev[rowIndex]!,
								[columnId]: value,
							}
						}
						return row
					}),
				)
			},
		},
		debugTable: import.meta.env.DEV,
	})

	// Expose table instance to parent via ref
	React.useImperativeHandle(ref, () => table, [table])

	return (
		<div className={cn('flex w-full flex-col', className)}>
			{/* top toolbar */}
			{/* <div className="flex shrink-0 items-center gap-2 overflow-auto border-b p-2"></div> */}

			<div className="overflow-auto" tabIndex={-1}>
				<table className="w-full table-auto border-separate border-spacing-0 text-sm">
					<thead className="bg-background sticky top-0 z-10">
						{table.getHeaderGroups().map(headerGroup => {
							return (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map(header => {
										return (
											<th
												key={header.id}
												colSpan={header.colSpan}
												className={cn(
													'text-muted-foreground bg-background border-foreground h-10 border-b px-2 py-1 text-left text-sm font-medium whitespace-nowrap',
													'[&:has([role=checkbox])]:px-1',
												)}
											>
												{header.isPlaceholder ? null : (
													<>
														<div
															className={`flex h-full items-center justify-between ${
																header.column.getCanSort()
																	? 'cursor-pointer select-none'
																	: ''
															}`}
															onClick={header.column.getToggleSortingHandler()}
															title={
																header.column.getCanSort()
																	? header.column.getNextSortingOrder() ===
																		'asc'
																		? 'Sort ascending'
																		: header.column.getNextSortingOrder() ===
																			  'desc'
																			? 'Sort descending'
																			: 'Clear sort'
																	: undefined
															}
														>
															<div className="flex items-center gap-1">
																{header.column.getIsSorted() === 'asc' ? (
																	<ArrowUp className="size-4" />
																) : header.column.getIsSorted() === 'desc' ? (
																	<ArrowUp className="size-4 rotate-180" />
																) : null}
																{flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
															</div>

															{/* TODO: DropdownMenu */}
														</div>
													</>
												)}
											</th>
										)
									})}
								</tr>
							)
						})}
					</thead>
					<tbody>
						{table.getRowModel().rows.map(row => {
							return (
								<React.Fragment key={row.id}>
									<tr className="hover:bg-muted transition-colors">
										{row.getVisibleCells().map(cell => {
											return (
												<td
													key={cell.id}
													className={`border-b ${editable ? '' : 'px-2 py-1'}`}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</td>
											)
										})}
									</tr>
									{row.getIsExpanded() && (
										<tr className="bg-primary/5">
											<td
												colSpan={row.getVisibleCells().length}
												className="border-b"
											>
												{/* child row content */}
												{expandedRowRender(row, table)}
											</td>
										</tr>
									)}
								</React.Fragment>
							)
						})}
					</tbody>
				</table>
			</div>

			{/* bottom toolbar */}
			<div className="mt-auto flex w-full shrink-0 items-center justify-between gap-3 overflow-auto border-t p-2 md:justify-end">
				<p className="text-muted-foreground text-xs whitespace-nowrap">
					{`${table.getCoreRowModel().rows.length} ${table.getCoreRowModel().rows.length !== 1 ? 'records' : 'record'}`}
				</p>

				<div className="inline-flex items-center justify-center gap-2">
					{/* page size */}
					<Select
						value={table.getState().pagination.pageSize.toString()}
						onValueChange={v => table.setPageSize(Number(v))}
					>
						<SelectTrigger className="h-7.5 w-fit text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{[10, 20, 50, 100, 500, 1000].map(pageSize => (
								<SelectItem key={pageSize} value={pageSize.toString()}>
									{pageSize} rows
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* pagination controls */}
					<div className="inline-flex items-center justify-center gap-1">
						<Button
							variant={'outline'}
							size={'icon'}
							className="size-7.5"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronsLeft />
						</Button>
						<Button
							variant={'outline'}
							size={'icon'}
							className="size-7.5"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft />
						</Button>
						<p className="px-1 text-xs whitespace-nowrap">
							<span className="text-muted-foreground">Page </span>
							<Input
								type="number"
								min="1"
								max={table.getPageCount()}
								value={table.getState().pagination.pageIndex + 1}
								onChange={e => {
									const page = e.target.value ? Number(e.target.value) - 1 : 0
									table.setPageIndex(page)
								}}
								className="h-7.5 w-12 px-1.5 py-1 text-xs"
							/>
							<span className="text-muted-foreground"> of </span>
							{table.getPageCount()}
						</p>
						<Button
							variant={'outline'}
							size={'icon'}
							className="size-7.5"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ChevronLeft className="rotate-180" />
						</Button>
						<Button
							variant={'outline'}
							size={'icon'}
							className="size-7.5"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<ChevronsLeft className="rotate-180" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

function createSelectColumn<TData extends RowData>(): ColumnDef<TData> {
	return {
		id: '_select',
		header: ({ table }) => (
			<div className="grid place-self-center p-0.5">
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					indeterminate={table.getIsSomePageRowsSelected()}
					onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
					aria-label="Select page rows"
					className=""
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="grid place-self-center p-0.5">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={v => row.toggleSelected(!!v)}
					aria-label="Select row"
					className=""
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	}
}
