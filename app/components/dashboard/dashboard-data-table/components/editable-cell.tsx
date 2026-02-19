import { useEffect, useState } from 'react'

import type { CellContext } from '@tanstack/react-table'

import { Input } from '~/components/ui/input'

export function EditableCell<TData>({
	getValue,
	row: { index },
	column: { id },
	table,
}: CellContext<TData, unknown>) {
	const initialValue = getValue()
	// We need to keep and update the state of the cell normally
	const [value, setValue] = useState(initialValue)

	// When the input is blurred, we'll call our table meta's updateData function
	const onBlur = () => {
		table.options.meta?.updateData(index, id, value)
	}

	// If the initialValue is changed external, sync it up with our state
	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	return (
		<Input
			value={(value || '') as string}
			onChange={e => setValue(e.target.value)}
			onBlur={onBlur}
			className="h-12 border-0 px-2 py-1 focus-visible:ring-inset"
		/>
	)
}
