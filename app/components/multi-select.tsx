import { Autocomplete } from '@base-ui/react/autocomplete'
import * as React from 'react'

import { PlusCircleIcon, WarningIcon, XIcon } from '@phosphor-icons/react'

import { Badge } from '~/components/ui/badge'
import { Spinner } from '~/components/ui/spinner'
import { cn } from '~/lib/utils'

import { Kbd } from './ui/kbd'

type Option = Record<'value' | 'label', string>
type DisplayOption = Option & {
	className?: string
	style?: React.CSSProperties
}

interface BadgeProps {
	option: DisplayOption
	handleUnselect: (option: DisplayOption) => void
}

const DefaultBadge = ({ option, handleUnselect }: BadgeProps) => (
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
			<XIcon className="h-3 w-3" />
		</button>
	</Badge>
)

interface MultiSelectProps {
	/** Array of { value, label } to select from */
	options?: Option[]
	/** Current selected options (controlled) */
	selected?: DisplayOption[]
	/** Callback when selected options change */
	onSelectedChange?: (selected: DisplayOption[]) => void
	/** Controlled input value */
	input?: string
	/** Controlled input setter */
	setInput?: React.Dispatch<React.SetStateAction<string>>
	/**
	 * Async search callback, fires on input change.
	 * When provided, disables built-in filter (parent controls items).
	 */
	onSearch?: (query: string) => void
	/** Called on first focus for lazy-loading */
	onInitSearch?: () => void
	/** Show loading state */
	isSearching?: boolean
	/** Allow creating new items that don't exist in options @default true */
	allowCreate?: boolean
	/** ID generator for newly created items */
	createId?: (value: string) => string
	/** Autocomplete mode @default 'list' – set 'both' for inline autocomplete */
	mode?: 'list' | 'both' | 'inline' | 'none'
	/** Placeholder text for the input field */
	placeholder?: string
	/** Additional class names for the input wrapper */
	className?: string
	/** Custom badge renderer for selected items */
	badge?: (props: BadgeProps) => React.ReactNode
	/** Error message */
	error?: string
	/** Error setter */
	setError?: React.Dispatch<React.SetStateAction<string>>
}

/**
 * MultiSelect built on top of `@base-ui/react/autocomplete`.
 *
 * Works inside Dialog / Sheet because no `<Autocomplete.Portal>` is used –
 * the popup renders inline, avoiding focus-trap conflicts with the parent dialog.
 */
export const MultiSelect = (props: MultiSelectProps) => {
	const {
		options = [],
		selected = [],
		onSelectedChange,
		input,
		setInput,
		onSearch,
		onInitSearch,
		isSearching,
		allowCreate = true,
		createId = (v: string) => `${Math.random().toString(36).slice(2)}-${v}`,
		mode = 'list',
		placeholder,
		className,
		badge: BadgeComponent = DefaultBadge,
		error: externalError,
		setError: externalSetError,
	} = props

	const init = React.useRef(false)
	const inputRef = React.useRef<HTMLInputElement>(null)
	const anchorRef = React.useRef<HTMLDivElement>(null)
	const portalContainerRef = React.useRef<HTMLDivElement>(null)

	// Flags to distinguish item-selection from normal typing inside onValueChange
	const isPointerSelectRef = React.useRef(false)
	const isEnterKeyRef = React.useRef(false)
	const isHandlingSelectRef = React.useRef(false)

	// ── input value (controlled / uncontrolled) ──────────────────────────
	const [internalInput, setInternalInput] = React.useState('')
	const inputValue = input ?? internalInput
	const setInputValue = setInput ?? setInternalInput

	// ── composition (IME) ────────────────────────────────────────────────
	const [isComposing, setIsComposing] = React.useState(false)

	// ── error (controlled / uncontrolled) ────────────────────────────────
	const [internalError, setInternalError] = React.useState(externalError ?? '')
	const error = externalError ?? internalError
	const setError = externalSetError ?? setInternalError

	// ── derived state ────────────────────────────────────────────────────
	const selectableOptions = React.useMemo(
		() => options.filter(o => !selected.some(s => s.value === o.value)),
		[options, selected],
	)

	const trimmedLower = inputValue.trim().toLowerCase()

	const hasPerfectMatch =
		!trimmedLower ||
		selectableOptions.some(
			o => o.label.trim().toLowerCase() === trimmedLower,
		) ||
		selected.some(s => s.label.trim().toLowerCase() === trimmedLower)

	const showCreateNew = allowCreate && !!inputValue.trim() && !hasPerfectMatch

	// ── handlers ─────────────────────────────────────────────────────────
	const handleSelect = React.useCallback(
		(option: Option) => {
			isHandlingSelectRef.current = true
			onSelectedChange?.([...selected, option])
			setInputValue('')
			// Re-focus so the popup re-opens for continuous selection
			requestAnimationFrame(() => {
				inputRef.current?.focus()
				isHandlingSelectRef.current = false
			})
		},
		[selected, onSelectedChange, setInputValue],
	)

	const handleUnselect = React.useCallback(
		(option: Option) => {
			onSelectedChange?.(selected.filter(s => s.value !== option.value))
		},
		[selected, onSelectedChange],
	)

	const createNewOption = React.useCallback(() => {
		const trimmed = inputValue.trim()
		if (!trimmed) return

		if (
			selected.some(s => s.label.trim().toLowerCase() === trimmed.toLowerCase())
		) {
			setError('Label already exists')
			return
		}

		handleSelect({
			value: createId(trimmed),
			label: trimmed,
		})
	}, [inputValue, selected, createId, handleSelect, setError])

	/**
	 * Called by Autocomplete.Root whenever the input text changes.
	 * Also fires when an item is selected (value becomes the item label).
	 */
	const handleValueChange = React.useCallback(
		(nextValue: string) => {
			// Skip programmatic clears after handleSelect
			if (isHandlingSelectRef.current) return

			// Detect item-selection via pointer or Enter
			if (isPointerSelectRef.current || isEnterKeyRef.current) {
				const matched = selectableOptions.find(o => o.label === nextValue)
				if (matched) {
					isPointerSelectRef.current = false
					isEnterKeyRef.current = false
					handleSelect(matched)
					return
				}
			}
			isPointerSelectRef.current = false
			isEnterKeyRef.current = false

			setInputValue(nextValue)
			onSearch?.(nextValue)
		},
		[selectableOptions, handleSelect, setInputValue, onSearch],
	)

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			setError('')
			if (isComposing) return

			if (e.key === 'Enter') {
				isEnterKeyRef.current = true
				// After a micro-task, check whether the Autocomplete consumed the
				// Enter (i.e. a highlighted item was selected → onValueChange fired).
				// If the flag is still set, no item was selected → create new.
				queueMicrotask(() => {
					if (isEnterKeyRef.current) {
						isEnterKeyRef.current = false
						if (showCreateNew) {
							createNewOption()
						}
					}
				})
			}

			if (
				(e.key === 'Backspace' || e.key === 'Delete') &&
				inputValue === '' &&
				selected.length > 0
			) {
				handleUnselect(selected[selected.length - 1])
			}
		},
		[
			isComposing,
			inputValue,
			selected,
			showCreateNew,
			createNewOption,
			handleUnselect,
			setError,
		],
	)

	return (
		<Autocomplete.Root
			items={selectableOptions}
			value={inputValue}
			onValueChange={handleValueChange}
			mode={mode}
			itemToStringValue={(item: Option) => item.label}
			filter={onSearch ? null : undefined}
		>
			{/* ── Input area with badges ─────────────────────────────────── */}
			<div
				ref={anchorRef}
				className={cn(
					'group border-input ring-offset-background focus-within:ring-ring focus-within:ring-offset cursor-text border px-2 py-2 text-sm focus-within:ring-1',
					className,
				)}
				onClick={() => inputRef.current?.focus()}
			>
				<div className="flex flex-wrap items-center gap-1">
					{selected.map(option => (
						<div key={option.value} onClick={e => e.stopPropagation()}>
							<BadgeComponent option={option} handleUnselect={handleUnselect} />
						</div>
					))}

					<Autocomplete.Input
						ref={inputRef}
						onKeyDown={handleKeyDown}
						onFocus={() => {
							if (!init.current) {
								init.current = true
								onInitSearch?.()
							}
						}}
						onCompositionStart={() => setIsComposing(true)}
						onCompositionEnd={() => setIsComposing(false)}
						placeholder={placeholder ?? 'Select...'}
						className="placeholder:text-muted-foreground ml-1 flex-1 bg-transparent outline-hidden"
					/>
				</div>
			</div>

			{/* Portal container – renders locally so it stays inside Dialog / Sheet */}
			<div ref={portalContainerRef} />

			<Autocomplete.Portal container={portalContainerRef}>
				<Autocomplete.Positioner
					className="z-50 outline-none"
					sideOffset={4}
					anchor={anchorRef}
				>
					<Autocomplete.Popup className="bg-popover text-popover-foreground max-h-60 w-[var(--anchor-width)] overflow-y-auto overscroll-contain border shadow-md">
						{isSearching ? (
							<div className="flex items-center justify-center py-4">
								<Spinner />
							</div>
						) : (
							<>
								{error && (
									<div className="border-b border-amber-500/50 px-2 py-1 text-amber-600">
										<p className="text-sm">
											<WarningIcon
												className="me-3 -mt-0.5 inline-flex opacity-60"
												size={16}
												aria-hidden="true"
											/>
											{error}
										</p>
									</div>
								)}

								{/* "Create new" – always first when no perfect match */}
								{showCreateNew && (
									<button
										onMouseDown={e => {
											e.preventDefault()
											e.stopPropagation()
										}}
										onClick={createNewOption}
										className="hover:bg-accent flex w-full cursor-pointer items-center px-3 py-2 text-sm outline-hidden select-none"
									>
										<PlusCircleIcon className="mr-2 h-4 w-4" />
										Create &quot;{inputValue.trim()}&quot;
										<Kbd className="ml-auto">return ⏎</Kbd>
									</button>
								)}

								<Autocomplete.List className="scroll-py-1 outline-0">
									{(option: Option) => (
										<Autocomplete.Item
											key={option.value}
											value={option}
											onPointerDown={() => {
												isPointerSelectRef.current = true
											}}
											className="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground flex cursor-default items-center px-3 py-2 text-sm outline-none select-none"
										>
											{option.label}
										</Autocomplete.Item>
									)}
								</Autocomplete.List>

								{!showCreateNew && (
									<Autocomplete.Empty>
										<div className="text-muted-foreground py-6 text-center text-sm">
											No options found...
										</div>
									</Autocomplete.Empty>
								)}
							</>
						)}
					</Autocomplete.Popup>
				</Autocomplete.Positioner>
			</Autocomplete.Portal>
		</Autocomplete.Root>
	)
}

export type { Option, DisplayOption, BadgeProps, MultiSelectProps }
