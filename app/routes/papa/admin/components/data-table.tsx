/**
 * DataTable component for displaying tabular data with sorting, filtering, and pagination.
 * This is a client side table
 */
import { useCallback, useState } from 'react'
import { useFetcher } from 'react-router'

import type {
	ColumnDef,
	ColumnFiltersState,
	RowSelectionState,
	SortingState,
	Table as TableType,
	VisibilityState,
} from '@tanstack/react-table'
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { EyeOff, Loader2, MoreHorizontal } from 'lucide-react'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { cn } from '~/lib/utils'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	children?: (table: TableType<TData>) => React.ReactNode
	hideColumnFilter?: boolean
	/**
	 * Default true, if false, will automatically hide select info on the bottom left.
	 */
	selectable?: boolean
	rowSelection?: RowSelectionState
	setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>
	/**
	 * Rows will render with the className if the rowId is in the rowIds set.
	 * This is useful for grouping rows together and applying a style to them.
	 * Or showing/hiding rows based on a condition.
	 *
	 * @example
	 * // The following will render pending ui for all rows with the id in the rowsDeleting set.
	 * const [rowsDeleting, setRowsDeleting] = useState<Set<string>>(new Set())
	 * const rowGroupStyle = [
	 *   {
	 *     className: 'opacity-50',
	 *     rowIds: rowsDeleting,
	 *   },
	 * ]
	 */
	rowGroupStyle?: RowGroupStyle[]
	/**
	 * Initial page size for pagination
	 * @default 10
	 */
	initialPageSize?: number
}

type RowGroupStyle = {
	className: string
	rowIds: Set<string>
}

// TODO: all filterable and sortable columns
export function DataTable<TData, TValue>({
	columns,
	data,
	children,
	hideColumnFilter,
	selectable = true,
	rowSelection: externalRowSelection,
	setRowSelection: externalSetRowSelection,
	rowGroupStyle,
	initialPageSize = 10,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: initialPageSize,
	})

	const [internalRowSelection, setInternalRowSelection] =
		useState<RowSelectionState>({})
	const rowSelection =
		externalRowSelection !== undefined
			? externalRowSelection
			: internalRowSelection
	const setRowSelection =
		externalSetRowSelection !== undefined
			? externalSetRowSelection
			: setInternalRowSelection

	const table = useReactTable({
		data,
		columns: [...(selectable ? [createSelectColumn<TData>()] : []), ...columns],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
		pageCount: Math.ceil(data.length / pagination.pageSize),
	})

	const getRowClassName = useCallback(
		(rowId: string) => {
			if (!rowGroupStyle || rowGroupStyle.length === 0) {
				return ''
			}

			const styleGroups = rowGroupStyle
				?.filter(rowGroup => rowGroup.rowIds.has(rowId))
				.map(g => g.className)

			return styleGroups.length > 0 ? styleGroups : ''
		},
		[rowGroupStyle],
	)

	return (
		<section className="relative flex flex-col gap-3">
			<div className="flex gap-2">
				{children && children(table)}

				{!hideColumnFilter && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto">
								<EyeOff />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter(column => column.getCanHide())
								.map(column => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={value =>
												column.toggleVisibility(!!value)
											}
											onSelect={e => e.preventDefault()}
										>
											{typeof column.columnDef.header === 'string'
												? column.columnDef.header
												: column.id}
										</DropdownMenuCheckboxItem>
									)
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
			<Table aria-label="table">
				<TableHeader aria-label="table-header">
					{/* <div className="z-10 absolute grow flex justify-center border rounded-xl px-2 py-1 mx-auto left-[50%] top-0 translate-x-[-50%] backdrop-blur-xs">
						<Button
							variant={'ghost'}
							onClick={() =>
								alert(JSON.stringify(table.getSelectedRowModel().rows, null, 2))
							}
						>
							Selected
						</Button>
					</div> */}
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id} className="border-primary">
							{headerGroup.headers.map(header => {
								return (
									<TableHead key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map(row => {
							const customClasses = getRowClassName(row.id)

							return (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									aria-label="table-row"
									className={cn('border-border', customClasses)}
								>
									{row.getVisibleCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							)
						})
					) : (
						<TableRow>
							<TableCell
								colSpan={selectable ? columns.length + 1 : columns.length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex items-center justify-between space-x-2 pt-4">
				{selectable && (
					<div className="flex-1 text-sm text-muted-foreground pl-2.5">
						{table.getFilteredSelectedRowModel().rows.length} of{' '}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
				)}

				<div className="ml-auto flex items-center space-x-2">
					<span className="text-xs text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of{' '}
						{table.getPageCount()}
					</span>
					<Select
						onValueChange={v =>
							setPagination({
								...pagination,
								pageSize: Number(v),
							})
						}
						defaultValue={pagination.pageSize.toString()}
					>
						<SelectTrigger className="w-[80px] h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
							<SelectItem value="100">100</SelectItem>
							<SelectItem value="250">200</SelectItem>
							<SelectItem value="500">500</SelectItem>
							<SelectItem value="1000">1000</SelectItem>
						</SelectContent>
					</Select>

					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</section>
	)
}

function createSelectColumn<T>(): ColumnDef<T> {
	return {
		id: '_select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="mr-1 rounded-none"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="mr-1 rounded-none"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	}
}

export const AdminDataTableMoreMenu = ({
	id,
	children,
	hideDelete,
	deleteTarget = '-->',
	onDelete,
}: {
	id: number | string
	/** Optional children, you could use <DropdownMenuItem> */
	children?: React.ReactNode
	/** If you don't want to provide delete function */
	hideDelete?: boolean
	/**
	 * Pass in for the display name of this object
	 * @default - using id
	 */
	deleteTarget?: string
	/** Callback function to handle deletion */
	onDelete?: () => void
}) => {
	const fetcher = useFetcher()
	const [open, setOpen] = useState(false)

	const isSubmitting = fetcher.state === 'submitting'
	const isDeleting = fetcher.state !== 'idle'

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size={'icon'} disabled={isDeleting}>
					<span className="sr-only">Open menu</span>
					{isSubmitting ? (
						<Loader2 className="animate-spin" />
					) : (
						<MoreHorizontal />
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuLabel>Manage</DropdownMenuLabel>

				{children && (
					<>
						<DropdownMenuSeparator />
						{children}
					</>
				)}

				{!hideDelete && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setOpen(true)}>
							Delete
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete{' '}
							<span className="font-bold text-primary">{deleteTarget}</span>
							(id: {id}).
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={onDelete}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DropdownMenu>
	)
}
