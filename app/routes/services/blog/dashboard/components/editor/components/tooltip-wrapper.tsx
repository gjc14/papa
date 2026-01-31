import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import { parseShortcutKeys } from '~/components/editor/utils'

/**
 * Tooltip wrapper to render tooltip with shortcut keys.
 */
export const TooltipWrapper = ({
	tooltip,
	shortcut,
	render,
	side = 'bottom',
}: {
	tooltip?: string
	shortcut?: string
	render?: React.ReactElement
	side?: 'top' | 'right' | 'bottom' | 'left'
}) => {
	const shortcutKeys = shortcut
		? parseShortcutKeys({ shortcutKeys: shortcut })
		: []

	return (
		<Tooltip>
			<TooltipTrigger render={render} />
			<TooltipContent side={side} className="px-2 py-1 text-xs">
				{tooltip}
				{shortcutKeys.length > 0 && (
					<kbd className="bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
						{shortcutKeys.join(' + ')}
					</kbd>
				)}
			</TooltipContent>
		</Tooltip>
	)
}
