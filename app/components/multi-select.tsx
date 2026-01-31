import * as React from 'react'

import { Command as CommandPrimitive, useCommandState } from 'cmdk'
import { PlusCircle, TriangleAlert, X } from 'lucide-react'

import { cn } from '../lib/utils'
import { Badge } from './ui/badge'
import { Command, CommandGroup, CommandItem, CommandList } from './ui/command'
import { Spinner } from './ui/spinner'

type Option = Record<'value' | 'label', string>
type DisplayOption = Option & {
	className?: string
	style?: React.CSSProperties
}

interface BadgeProps {
	option: DisplayOption
	handleUnselect: (option: DisplayOption) => void
}

const DefaultBadge = ({ option, handleUnselect }: BadgeProps) => {
	return (
		<Badge
			key={option.value}
			className={cn('my-auto', option.className)}
			style={option.style}
		>
			{option.label}
			<button
				className="ring-offset-background focus:ring-ring ml-1.5 cursor-pointer outline-hidden focus:ring-2"
				onClick={() => handleUnselect(option)}
			>
				<X className="h-3 w-3" />
			</button>
		</Badge>
	)
}

interface MultiSelectInputProps {
	/** Array of { value, label } to select from */
	options?: Option[]
	/** options selected by default */
	defaultSelected?: DisplayOption[]
	/** Current selected options */
	selected?: DisplayOption[]
	/** Callback function when the selected options change, returns current select state */
	onSelectedChange?: (selected: DisplayOption[]) => void
	/** Input state */
	input?: string
	/** Input state */
	setInput?: React.Dispatch<React.SetStateAction<string>>
	/** When CommandList first triggered, useful for lazy load */
	onInitSearch?: () => void
	/** Display ui when is searching */
	isSearching?: boolean
	/** Callback function to create id for the new option created @default Math.random().toString(36).slice(2) */
	createId?: (value: string) => string
	/** Placeholder text for the input field */
	placeholder?: string
	/** Additional class names for the input field */
	className?: string
	/** Custom badge component to render selected options */
	badge?: (props: BadgeProps) => React.ReactNode
	/** Error message state */
	error?: string
	/** Error message state */
	setError?: React.Dispatch<React.SetStateAction<string>>
}

export const MultiSelect = (props: MultiSelectInputProps) => {
	return (
		// Wrap in Command to use useCommandState
		<Command className="overflow-visible bg-transparent">
			<InternalMultiSelect {...props} />
		</Command>
	)
}

const InternalMultiSelect = (props: MultiSelectInputProps) => {
	const {
		options = [],
		defaultSelected,
		selected,
		onSelectedChange,
		input,
		setInput,
		onInitSearch,
		isSearching,
		createId = v => `${Math.random().toString(36).slice(2)}-${v}`,
		placeholder,
		className,
		badge: BadgeComponent = DefaultBadge,
		error: ExternalError,
		setError: ExternalSetError,
	} = props

	const init = React.useRef(false)
	const inputRef = React.useRef<HTMLInputElement>(null)

	const [internalInputValue, setInternalInputValue] = React.useState(
		input ?? '',
	)
	const inputValue = input ?? internalInputValue
	const setInputValue = setInput ?? setInternalInputValue

	const [isComposing, setIsComposing] = React.useState(false)

	const [open, setOpen] = React.useState(false)

	const [internalError, internalSetError] = React.useState<string>(
		ExternalError ?? '',
	)
	const error = ExternalError ?? internalError
	const setError = ExternalSetError ?? internalSetError

	const [internalSelected, setInternalSelected] = React.useState<
		DisplayOption[]
	>(defaultSelected ?? [])

	const currentSelected = selected ?? internalSelected

	const selectableOptions = options.filter(
		o => !currentSelected.some(s => s.value === o.value),
	)

	const noOptions = useCommandState(s => s.filtered.count) === 0

	/** Helper function to update (un)controlled selected state */
	const handleUpdate = React.useCallback(
		(selected: Option[]) => {
			onSelectedChange?.(selected)
			setInternalSelected(selected)
		},
		[onSelectedChange],
	)

	const handleUnselect = (option: Option) => {
		handleUpdate(currentSelected.filter(s => s.value !== option.value))
	}

	const optionLabelExists = (label: string, options: Option[]) => {
		return options.some(
			option =>
				option.label.trim().toLowerCase() === label.trim().toLowerCase(),
		)
	}

	/** Helper function to handle new option creation @returns void */
	const createNewOption = React.useCallback(() => {
		if (!inputValue.trim()) return

		const labelExists = optionLabelExists(inputValue, currentSelected)
		if (labelExists) {
			return setError('Label already exists')
		}

		const newOption: Option = {
			value: createId(inputValue.trim()),
			label: inputValue.trim(),
		}

		handleUpdate([...currentSelected, newOption])
		setInputValue('')
	}, [currentSelected, createId, handleUpdate])

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			setError('')
			if (isComposing) return e.stopPropagation()

			if (e.key === 'Enter') {
				// Create new option if no options are available
				if (noOptions) {
					createNewOption()
					return e.stopPropagation()
				}
			}
			if (e.key === 'Delete' || e.key === 'Backspace') {
				if (inputValue === '') {
					handleUnselect(currentSelected[currentSelected.length - 1])
					return e.stopPropagation()
				}
			}
		},
		[
			isComposing,
			inputValue,
			noOptions,
			createNewOption,
			handleUnselect,
			currentSelected,
		],
	)

	return (
		<>
			<div
				className={cn(
					'group border-input ring-offset-background focus-within:ring-ring focus-within:ring-offset cursor-text border px-2 py-2 text-sm focus-within:ring-1',
					className,
				)}
				onClick={() => inputRef.current?.focus()}
			>
				<div className="flex flex-wrap items-center gap-1">
					{currentSelected.map(option => (
						<div key={option.value} onClick={e => e.stopPropagation()}>
							<BadgeComponent option={option} handleUnselect={handleUnselect} />
						</div>
					))}

					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={setInputValue}
						onKeyDown={handleKeyDown}
						onBlur={() => setOpen(false)}
						onFocus={() => {
							setOpen(true)

							// Trigger onInitSearch only the first time CommandList is opened
							!init.current && (init.current = true) && onInitSearch?.()
						}}
						onCompositionStart={() => {
							setIsComposing(true)
						}}
						onCompositionEnd={() => {
							setIsComposing(false)
						}}
						placeholder={placeholder ?? 'Select...'}
						className="placeholder:text-muted-foreground ml-1 flex-1 bg-transparent outline-hidden"
					/>
				</div>
			</div>
			<div className="relative mt-2">
				{open && (
					// Canvas
					<CommandList>
						{/**
						 * User flow:
						 *
						 * 1. Focus and display selectableOptions in CommandGroup (not applicable if no options provided)
						 * 2. If inputValue, filter selectableOptions (not applicable if no options provided)
						 * 3. Display add new item option if inputValue and no options match (both empty and non-empty should work)
						 */}
						<div
							className={`bg-popover text-popover-foreground animate-in absolute top-0 z-10 w-full border shadow-md outline-hidden`}
						>
							{/* When searching */}
							{isSearching ? (
								<CommandGroup className="flex items-center justify-center py-2">
									<Spinner />
								</CommandGroup>
							) : (
								<>
									{/* Rendered when count = 0 */}
									{inputValue.trim() ? (
										<CommandPrimitive.Empty className="p-1 text-sm">
											<button
												onMouseDown={e => {
													e.preventDefault()
													e.stopPropagation()
												}}
												onClick={createNewOption}
												className="bg-accent flex w-full cursor-pointer items-center px-2 py-1.5 text-sm outline-hidden select-none"
											>
												<PlusCircle className="mr-2 h-4 w-4" />"
												{inputValue.trim()}"
												<kbd className="ml-auto text-xs text-nowrap">
													return ⏎
												</kbd>
											</button>
										</CommandPrimitive.Empty>
									) : (
										<CommandPrimitive.Empty className="py-6 text-center text-sm">
											No options found...
										</CommandPrimitive.Empty>
									)}

									<CommandGroup className={noOptions ? 'hidden' : ''}>
										{error && (
											<div className="mb-2 border border-amber-500/50 px-2 py-1 text-amber-600">
												<p className="text-sm">
													<TriangleAlert
														className="me-3 -mt-0.5 inline-flex opacity-60"
														size={16}
														aria-hidden="true"
													/>
													{error}
												</p>
											</div>
										)}

										{selectableOptions.map(option => (
											<CommandItem
												key={option.value}
												onMouseDown={e => {
													e.preventDefault()
													e.stopPropagation()
												}}
												onSelect={() => {
													handleUpdate([...currentSelected, option])
													setInputValue('')
												}}
												className="cursor-pointer"
											>
												{option.label}
											</CommandItem>
										))}

										{inputValue.trim() &&
											!optionLabelExists(inputValue, selectableOptions) && (
												<CommandItem
													onMouseDown={e => {
														e.preventDefault()
														e.stopPropagation()
													}}
													onSelect={createNewOption}
													className="cursor-pointer"
												>
													<PlusCircle className="mr-2 h-4 w-4" />"
													{inputValue.trim()}"
													<kbd className="ml-auto text-xs text-nowrap">
														return ⏎
													</kbd>
												</CommandItem>
											)}
									</CommandGroup>
								</>
							)}
						</div>
					</CommandList>
				)}
			</div>
		</>
	)
}
