import { atom } from 'jotai'
import { Baseline, Paintbrush } from 'lucide-react'
import tailwindColors from 'tailwindcss/colors.js'

import { TooltipProvider } from '~/components/ui/tooltip'

import { ColorDropdownMenu } from './components/color-dropdown'
import { LinkUnlinkButtons } from './components/link-unlink-button'
import { MoreDropdownMenu } from './components/more-dropdown'
import { SelectDropdownMenu } from './components/select-dropdown'
import { ToggleButton } from './components/toggle-button'
import {
	AdvancedParagraphOptions,
	AlignOptions,
	createColorOption,
	createHighlightOption,
	ListOptions,
	MarkOptions,
	MiscOptions,
	ParagraphOptions,
	RemoveFormattingOption,
	SubSuperScriptOptions,
	UndoRedoOptions,
} from './edit-options'

export const isToolbarOpenAtom = atom(true)

const getColors = () =>
	Object.entries(tailwindColors)
		.filter(([name, value]) => typeof value !== 'string')
		.map(([name, value]) => name)

const colors = getColors()

const colorOptions = colors
	.slice(5)
	.map(c => createColorOption({ name: c, color: `var(--text-${c})` }))

const highlightOptions = colors
	.slice(5)
	.map(c => createHighlightOption({ name: c, color: `var(--highlight-${c})` }))

export function Toolbar({
	hidden,
	isMobile,
}: {
	hidden?: boolean
	isMobile?: boolean
}) {
	if (hidden) return null

	return (
		<TooltipProvider delayDuration={800}>
			<div
				id="editor-toolbar"
				className={`bg-background/80 absolute right-0 ${isMobile ? 'bottom-0' : 'top-0'} left-0 z-20 w-full overflow-x-scroll border-y backdrop-blur-sm`}
			>
				<div
					id="buttons"
					className="mx-auto flex h-fit w-fit flex-1 items-center justify-start gap-0.25 p-1"
				>
					{/* Undo/Redo */}
					{UndoRedoOptions.map(
						({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
							<ToggleButton
								key={index}
								tooltip={name}
								shortcut={shortcut}
								run={run}
								canRun={canRun}
								isActive={isActive}
							>
								<Icon />
							</ToggleButton>
						),
					)}

					<Separator />

					<SelectDropdownMenu options={ParagraphOptions} tooltip="Hierarchy" />
					<SelectDropdownMenu options={ListOptions} tooltip="List styles" />

					{AdvancedParagraphOptions.map(
						({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
							<ToggleButton
								key={index}
								tooltip={name}
								shortcut={shortcut}
								run={run}
								canRun={canRun}
								isActive={isActive}
							>
								<Icon />
							</ToggleButton>
						),
					)}

					<Separator />

					{/* Marks */}
					{MarkOptions.map(
						({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
							<ToggleButton
								key={index}
								tooltip={name}
								shortcut={shortcut}
								run={run}
								canRun={canRun}
								isActive={isActive}
							>
								<Icon />
							</ToggleButton>
						),
					)}

					{/* link, image, video */}
					<LinkUnlinkButtons />

					<Separator />

					<ColorDropdownMenu
						options={colorOptions}
						icon={<Baseline />}
						activeIndicator="text"
						canRemove={editor =>
							editor.can().chain().focus().unsetColor().run()
						}
						onRemove={editor => editor.chain().focus().unsetColor().run()}
						tooltip="Text color options"
					/>
					<ColorDropdownMenu
						options={highlightOptions}
						icon={<Paintbrush />}
						activeIndicator="background"
						canRemove={editor =>
							editor.can().chain().focus().unsetHighlight().run()
						}
						onRemove={editor => editor.chain().focus().unsetHighlight().run()}
						tooltip="Highlight color options"
					/>

					<Separator />

					{/* SubSuperScript */}
					{SubSuperScriptOptions.map(
						({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
							<ToggleButton
								key={index}
								tooltip={name}
								shortcut={shortcut}
								run={run}
								canRun={canRun}
								isActive={isActive}
							>
								<Icon />
							</ToggleButton>
						),
					)}

					<Separator />

					{/* Align */}
					{AlignOptions.map(
						({ name, shortcut, icon: Icon, run, canRun, isActive }, index) => (
							<ToggleButton
								key={index}
								tooltip={name}
								shortcut={shortcut}
								run={run}
								canRun={canRun}
								isActive={isActive}
							>
								<Icon />
							</ToggleButton>
						),
					)}

					<Separator />

					{/* Remove Formatting */}
					<ToggleButton
						tooltip={RemoveFormattingOption.name}
						shortcut={RemoveFormattingOption.shortcut}
						run={RemoveFormattingOption.run}
						canRun={RemoveFormattingOption.canRun}
						isActive={RemoveFormattingOption.isActive}
					>
						<RemoveFormattingOption.icon />
					</ToggleButton>

					<Separator />

					{/* Misc */}
					<MoreDropdownMenu options={MiscOptions} />
				</div>
			</div>
		</TooltipProvider>
	)
}

const Separator = () => (
	<div className="bg-border mx-2 my-1 w-px self-stretch" />
)
