'use client'

import * as React from 'react'

import { ChevronRight } from 'lucide-react'

import { Checkbox } from '~/components/ui/checkbox'
import { cn } from '~/lib/utils'

export interface TreeNode {
	id: string
	label: string
	children?: TreeNode[]
}

interface CheckboxTreeProps {
	data: TreeNode[]
	selectedIds?: string[]
	onSelectionChange?: (selectedIds: string[]) => void
	className?: string
}

interface CheckboxTreeItemProps {
	node: TreeNode
	level: number
	selectedIds: Set<string>
	onToggle: (id: string) => void
	getNodeState: (node: TreeNode) => boolean | 'indeterminate'
}

function CheckboxTreeItem({
	node,
	level,
	selectedIds,
	onToggle,
	getNodeState,
}: CheckboxTreeItemProps) {
	const [isExpanded, setIsExpanded] = React.useState(false)
	const checkboxRef = React.useRef<HTMLButtonElement>(null)
	const hasChildren = node.children && node.children.length > 0
	const state = getNodeState(node)

	React.useEffect(() => {
		if (checkboxRef.current) {
			const input = checkboxRef.current.querySelector('input')
			if (input) {
				input.indeterminate = state === 'indeterminate'
			}
		}
	}, [state])

	const paddingMap: Record<number, string> = {
		0: '',
		1: 'pl-6',
		2: 'pl-12',
		3: 'pl-18',
		4: 'pl-24',
	}

	return (
		<div className="select-none">
			<div
				className={cn(
					'hover:bg-muted/50 flex items-center gap-1 py-1.5 pl-1 transition-colors',
					paddingMap[level],
				)}
			>
				{hasChildren ? (
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex h-4 w-4 items-center justify-center transition-colors"
						aria-label={isExpanded ? 'Collapse' : 'Expand'}
					>
						<ChevronRight
							className={cn(
								'text-muted-foreground h-3.5 w-3.5 transition-transform',
								isExpanded && 'rotate-90',
							)}
						/>
					</button>
				) : (
					<div className="w-4" />
				)}

				<div className="flex min-w-0 flex-1 items-center gap-2">
					<Checkbox
						ref={checkboxRef}
						id={`checkbox-${node.id}`}
						checked={!!state}
						onCheckedChange={() => onToggle(node.id)}
						className="shrink-0 cursor-pointer"
					/>
					<label
						htmlFor={`checkbox-${node.id}`}
						className="flex-1 cursor-pointer truncate text-sm"
					>
						{node.label}
					</label>
				</div>
			</div>

			{hasChildren && isExpanded && (
				<div className="ml-0">
					{node.children!.map(child => (
						<CheckboxTreeItem
							key={child.id}
							node={child}
							level={level + 1}
							selectedIds={selectedIds}
							onToggle={onToggle}
							getNodeState={getNodeState}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export function CheckboxTree({
	data,
	selectedIds = [],
	onSelectionChange,
	className,
}: CheckboxTreeProps) {
	const [selected, setSelected] = React.useState<Set<string>>(
		new Set(selectedIds),
	)

	React.useEffect(() => {
		setSelected(new Set(selectedIds))
	}, [selectedIds])

	const getDescendantIds = React.useCallback((node: TreeNode): string[] => {
		if (!node.children || node.children.length === 0) {
			return []
		}
		const ids: string[] = []
		const traverse = (n: TreeNode) => {
			if (n.children) {
				n.children.forEach(child => {
					ids.push(child.id)
					traverse(child)
				})
			}
		}
		traverse(node)
		return ids
	}, [])

	const hasSelectedChildren = React.useCallback(
		(node: TreeNode): boolean => {
			if (!node.children || node.children.length === 0) {
				return false
			}
			const descendantIds = getDescendantIds(node)
			return descendantIds.some(id => selected.has(id))
		},
		[selected, getDescendantIds],
	)

	const getNodeState = React.useCallback(
		(node: TreeNode): boolean | 'indeterminate' => {
			const isChecked = selected.has(node.id)
			const hasChildren = node.children && node.children.length > 0

			if (isChecked) {
				return true
			} else if (hasChildren && hasSelectedChildren(node)) {
				return 'indeterminate'
			} else return false
		},
		[selected, hasSelectedChildren],
	)

	const handleToggle = React.useCallback(
		(id: string) => {
			const newSelected = new Set(selected)
			if (newSelected.has(id)) {
				newSelected.delete(id)
			} else {
				newSelected.add(id)
			}
			setSelected(newSelected)
			onSelectionChange?.(Array.from(newSelected))
		},
		[selected, onSelectionChange],
	)

	return (
		<div className={cn('space-y-0.5', className)}>
			{data.map(node => (
				<CheckboxTreeItem
					key={node.id}
					node={node}
					level={0}
					selectedIds={selected}
					onToggle={handleToggle}
					getNodeState={getNodeState}
				/>
			))}
		</div>
	)
}
