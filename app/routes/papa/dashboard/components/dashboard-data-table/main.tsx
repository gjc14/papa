import React from 'react'

import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type Row,
	type RowData,
	type Table as TableType,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronsLeft, Maximize } from 'lucide-react'

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

import { useSkipper } from './hooks'

declare module '@tanstack/react-table' {
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: unknown) => void
	}
}

// Give our default column cell renderer editing superpowers!
function createDefaultColumn<TData>(
	editable: boolean,
): Partial<ColumnDef<TData, unknown>> {
	return {
		cell: ({ getValue, row: { index }, column: { id }, table }) => {
			const initialValue = getValue()

			if (!editable) {
				const displayValue =
					typeof initialValue === 'object' && initialValue !== null ? (
						Array.isArray(initialValue) ? (
							<div className="flex items-center gap-1">
								{initialValue.map(v => (
									<Badge key={v.toString()} className="rounded-none">
										{v}
									</Badge>
								))}
							</div>
						) : (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={'ghost'}
										size={'icon'}
										className="text-muted-foreground size-6"
									>
										<Maximize className="size-3.5" />
									</Button>
								</PopoverTrigger>
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
					<div className="flex h-12 items-center p-2 text-sm">
						{displayValue}
					</div>
				)
			}

			// We need to keep and update the state of the cell normally
			const [value, setValue] = React.useState(initialValue)

			// When the input is blurred, we'll call our table meta's updateData function
			const onBlur = () => {
				table.options.meta?.updateData(index, id, value)
			}

			// If the initialValue is changed external, sync it up with our state
			React.useEffect(() => {
				setValue(initialValue)
			}, [initialValue])

			return (
				<Input
					value={(value || '') as string}
					onChange={e => setValue(e.target.value)}
					onBlur={onBlur}
					className="h-12 rounded-none border-0 focus-visible:ring-inset"
				/>
			)
		},
	}
}

interface DashboardDataTableProps<TData, TValue> {
	ref: React.Ref<TableType<TData>>
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	setData: React.Dispatch<React.SetStateAction<TData[]>>
	/**
	 * if true, a select column will be shown on the left.
	 * @default false
	 */
	selectable?: boolean
	/**
	 * Function to determine if a row is expandable
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
	/**
	 * if true, default column will render an input in the cell.
	 * @default false
	 */
	editable?: boolean
	/**
	 * - Enables/disables row selection for all rows in the table OR
	 * - A function that given a row, returns whether to enable/disable row selection for that row
	 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/row-selection#enablerowselection)
	 * @link [Guide](https://tanstack.com/table/v8/docs/guide/row-selection)
	 */
	enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
	/** @default 0 */
	initialPageIndex?: number
	/** @default 10 */
	initialPageSize?: number
	/** Determine if page index should reset, value returned from [useSkipper](./hooks.ts) */
	autoResetPageIndex?: boolean
	/**  */
	skipAutoResetPageIndex?: () => void
	className?: string
}

export function DashboardDataTable<TData extends RowData, TValue>({
	ref,
	columns,
	data,
	setData,
	selectable = false,
	editable = false,
	enableRowSelection,
	initialPageIndex = 0,
	initialPageSize = 10,
	getRowCanExpand,
	expandedRowRender = () => null,
	autoResetPageIndex,
	skipAutoResetPageIndex,
	className,
}: DashboardDataTableProps<TData, TValue>) {
	const [pagination, setPagination] = React.useState({
		pageIndex: initialPageIndex,
		pageSize: initialPageSize,
	})
	const [rowSelection, setRowSelection] = React.useState({})

	const [internalAutoResetPageIndex, internalSkipAutoResetPageIndex] =
		useSkipper()

	const selectColumn = React.useMemo(() => createSelectColumn<TData>(), [])
	const defaultColumn = React.useMemo(
		() => createDefaultColumn<TData>(editable),
		[editable],
	)

	const table = useReactTable<TData>({
		defaultColumn,
		columns: [...(selectable ? [selectColumn] : []), ...columns],
		data,
		getCoreRowModel: getCoreRowModel(),

		getPaginationRowModel: getPaginationRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		/** @see https://tanstack.com/table/latest/docs/framework/react/examples/expanding */
		getRowCanExpand,
		/** @see https://tanstack.com/table/v8/docs/guide/column-filtering#manual-server-side-filtering */
		manualFiltering: true, // manual server-side filtering
		autoResetPageIndex: autoResetPageIndex ?? internalAutoResetPageIndex,
		enableRowSelection,

		state: {
			pagination,
			/** @see https://tanstack.com/table/v8/docs/guide/row-selection#access-row-selection-state */
			rowSelection,
		},
		onPaginationChange: setPagination,
		onRowSelectionChange: setRowSelection,

		// Provide our updateData function to our table meta
		meta: {
			updateData: (rowIndex, columnId, value) => {
				// Skip page index reset until after next rerender
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
													'text-muted-foreground bg-background h-10 border-b px-2 py-1 text-left text-sm font-medium whitespace-nowrap',
													'[&:has([role=checkbox])]:px-1',
												)}
											>
												{header.isPlaceholder ? null : (
													<div>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
														{/* TODO: dropdown menu */}
													</div>
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
												<td key={cell.id} className="border-b">
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
						<SelectTrigger className="h-7.5 w-[108px] text-xs">
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
								className="h-7.5 w-12 rounded-md px-1.5 py-1 text-xs"
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
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
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
