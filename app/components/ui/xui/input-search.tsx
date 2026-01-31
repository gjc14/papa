import React, { useId } from 'react'

import { LoaderCircle, Search } from 'lucide-react'

import { cn } from '~/lib/utils'

import { Input } from '../input'

export function InputSearch(
	props: React.ComponentProps<typeof Input> & {
		isLoading?: boolean
	},
) {
	const { isLoading = false, className, ...inputProps } = props

	const id = useId()

	return (
		<div className="relative">
			<Input
				id={id}
				className={cn('peer ps-9', className)}
				placeholder="Search..."
				type="search"
				{...inputProps}
			/>
			<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
				{isLoading ? (
					<LoaderCircle
						className="animate-spin"
						size={16}
						strokeWidth={2}
						role="status"
						aria-label="Loading..."
					/>
				) : (
					<Search size={16} strokeWidth={2} aria-hidden="true" />
				)}
			</div>
		</div>
	)
}
InputSearch.displayName = 'InputSearch'
