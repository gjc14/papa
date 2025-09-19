import type { SetImageOptions } from '@tiptap/extension-image'
import { Editor } from '@tiptap/react'
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Baseline,
	Bold,
	Braces,
	Code,
	CornerDownLeft,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Highlighter,
	Image,
	Italic,
	Link,
	List,
	ListOrdered,
	ListTodoIcon,
	Minus,
	Pilcrow,
	Quote,
	Redo,
	RemoveFormatting,
	Strikethrough,
	Subscript,
	Superscript,
	Underline as UnderlineIcon,
	Undo,
	type LucideIcon,
} from 'lucide-react'

export interface EditOptionProps {
	name: string
	/** e.g. ctrl+alt+shift */
	shortcut?: string
	icon: LucideIcon
	isActive?: (editor: Editor) => boolean
	run: (editor: Editor) => void
	canRun: (editor: Editor) => boolean
}

const MarkOptions: EditOptionProps[] = [
	{
		name: 'Bold',
		shortcut: 'ctrl+b',
		icon: Bold,
		isActive: (editor: Editor) => editor.isActive('bold'),
		run: (editor: Editor) => editor.chain().focus().toggleBold().run(),
		canRun: (editor: Editor) => editor.can().chain().focus().toggleBold().run(),
	},
	{
		name: 'Italic',
		shortcut: 'ctrl+i',
		icon: Italic,
		isActive: (editor: Editor) => editor.isActive('italic'),
		run: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleItalic().run(),
	},
	{
		name: 'Underline',
		shortcut: 'ctrl+u',
		icon: UnderlineIcon,
		isActive: (editor: Editor) => editor.isActive('underline'),
		run: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleUnderline().run(),
	},
	{
		name: 'Strikethrough',
		shortcut: 'ctrl+shift+s',
		icon: Strikethrough,
		isActive: (editor: Editor) => editor.isActive('strike'),
		run: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleStrike().run(),
	},
	{
		name: 'Code',
		shortcut: 'ctrl+e',
		icon: Code,
		isActive: (editor: Editor) => editor.isActive('code'),
		run: (editor: Editor) => editor.chain().focus().toggleCode().run(),
		canRun: (editor: Editor) => editor.can().chain().focus().toggleCode().run(),
	},
]

const SubSuperScriptOptions: EditOptionProps[] = [
	{
		name: 'Superscript',
		shortcut: 'ctrl+.',
		icon: Superscript,
		isActive: (editor: Editor) => editor.isActive('superscript'),
		run: (editor: Editor) => editor.chain().focus().toggleSuperscript().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleSuperscript().run(),
	},
	{
		name: 'Subscript',
		shortcut: 'ctrl+,',
		icon: Subscript,
		isActive: (editor: Editor) => editor.isActive('subscript'),
		run: (editor: Editor) => editor.chain().focus().toggleSubscript().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleSubscript().run(),
	},
]

const createHighlightOption = ({
	name,
	color,
}: {
	name: string
	color: string
}): EditOptionProps & { color: string } => ({
	name: name,
	shortcut: 'ctrl+shift+h',
	icon: Highlighter,
	isActive: editor => editor.isActive('highlight', { color }),
	run: (editor: Editor) => editor.chain().focus().setHighlight({ color }).run(),
	canRun: (editor: Editor) =>
		editor.can().chain().focus().setHighlight({ color }).run(),
	color,
})

const createColorOption = ({
	name,
	color,
}: {
	name: string
	color: string
}): EditOptionProps & { color: string } => ({
	name: name,
	icon: Baseline,
	isActive: editor => editor.isActive('textStyle', { color }),
	run: (editor: Editor) => editor.chain().focus().setColor(color).run(),
	canRun: (editor: Editor) =>
		editor.can().chain().focus().setColor(color).run(),
	color,
})

const createFontFamilyOption = (fontFamily: string): EditOptionProps => ({
	name: 'Font Family',
	icon: Baseline,
	run: (editor: Editor) =>
		editor.chain().focus().setFontFamily(fontFamily).run(),
	canRun: (editor: Editor) =>
		editor.can().chain().focus().setFontFamily(fontFamily).run(),
})

const RemoveFormattingOption: EditOptionProps = {
	name: 'Remove Formatting',
	icon: RemoveFormatting,
	run: (editor: Editor) => editor.chain().focus().unsetAllMarks().run(),
	canRun: () => true,
}

const ParagraphOptions: EditOptionProps[] = [
	{
		name: 'Paragraph',
		shortcut: 'ctrl+alt+0',
		icon: Pilcrow,
		isActive: (editor: Editor) => editor.isActive('paragraph'),
		run: (editor: Editor) => editor.chain().focus().setParagraph().run(),
		canRun: () => true,
	},
	{
		name: 'Heading 2',
		shortcut: 'ctrl+alt+2',
		icon: Heading2,
		isActive: (editor: Editor) => editor.isActive('heading', { level: 2 }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 2 }).run(),
		canRun: () => true,
	},
	{
		name: 'Heading 3',
		shortcut: 'ctrl+alt+3',
		icon: Heading3,
		isActive: (editor: Editor) => editor.isActive('heading', { level: 3 }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 3 }).run(),
		canRun: () => true,
	},
	{
		name: 'Heading 4',
		shortcut: 'ctrl+alt+4',
		icon: Heading4,
		isActive: (editor: Editor) => editor.isActive('heading', { level: 4 }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 4 }).run(),
		canRun: () => true,
	},
	{
		name: 'Heading 5',
		shortcut: 'ctrl+alt+5',
		icon: Heading5,
		isActive: (editor: Editor) => editor.isActive('heading', { level: 5 }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 5 }).run(),
		canRun: () => true,
	},
]

const AdvancedParagraphOptions: EditOptionProps[] = [
	{
		name: 'Blockquote',
		shortcut: 'ctrl+shift+b',
		icon: Quote,
		isActive: (editor: Editor) => editor.isActive('blockquote'),
		run: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleBlockquote().run(),
	},
	{
		name: 'Code Block',
		shortcut: 'ctrl+alt+c',
		icon: Braces,
		isActive: (editor: Editor) => editor.isActive('codeBlock'),
		run: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
		canRun: (editor: Editor) =>
			editor.can().chain().focus().toggleCodeBlock().run(),
	},
]

const ListOptions: EditOptionProps[] = [
	{
		name: 'Ordered List',
		shortcut: 'ctrl+shift+7',
		icon: ListOrdered,
		isActive: (editor: Editor) => editor.isActive('orderedList'),
		run: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
		canRun: () => true,
	},
	{
		name: 'Bullet List',
		shortcut: 'ctrl+shift+8',
		icon: List,
		isActive: (editor: Editor) => editor.isActive('bulletList'),
		run: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
		canRun: () => true,
	},
	{
		name: 'Check List',
		shortcut: 'ctrl+shift+9',
		icon: ListTodoIcon,
		isActive: (editor: Editor) => editor.isActive('taskList'),
		run: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
		canRun: () => true,
	},
]

const AlignOptions: EditOptionProps[] = [
	{
		name: 'Align Left',
		shortcut: 'ctrl+shift+i',
		icon: AlignLeft,
		isActive: (editor: Editor) => editor.isActive({ textAlign: 'left' }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleTextAlign('left').run(),
		canRun: () => true,
	},
	{
		name: 'Align Center',
		shortcut: 'ctrl+shift+e',
		icon: AlignCenter,
		isActive: (editor: Editor) => editor.isActive({ textAlign: 'center' }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleTextAlign('center').run(),
		canRun: () => true,
	},
	{
		name: 'Align Right',
		shortcut: 'ctrl+shift+r',
		icon: AlignRight,
		isActive: (editor: Editor) => editor.isActive({ textAlign: 'right' }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleTextAlign('right').run(),
		canRun: () => true,
	},
	{
		name: 'Justify',
		shortcut: 'ctrl+shift+j',
		icon: AlignJustify,
		isActive: (editor: Editor) => editor.isActive({ textAlign: 'justify' }),
		run: (editor: Editor) =>
			editor.chain().focus().toggleTextAlign('justify').run(),
		canRun: () => true,
	},
]

const MiscOptions: EditOptionProps[] = [
	{
		name: 'Separator',
		icon: Minus,
		run: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
		canRun: () => true,
	},
	{
		name: 'Hard Break',
		shortcut: 'ctrl/shift+enter',
		icon: CornerDownLeft,
		run: (editor: Editor) => editor.chain().focus().setHardBreak().run(),
		canRun: () => true,
	},
]

const UndoRedoOptions: EditOptionProps[] = [
	{
		name: 'Undo',
		shortcut: 'ctrl+z',
		icon: Undo,
		run: (editor: Editor) => editor.chain().focus().undo().run(),
		canRun: (editor: Editor) => editor.can().chain().focus().undo().run(),
	},
	{
		name: 'Redo',
		shortcut: 'ctrl+shift+z',
		icon: Redo,
		run: (editor: Editor) => editor.chain().focus().redo().run(),
		canRun: (editor: Editor) => editor.can().chain().focus().redo().run(),
	},
]

// LinkUnlink Image Video
const createLinkUnlinkOption = (href?: string) => ({
	name: 'Link/Unlink',
	shortcut: 'ctrl+k',
	icon: Link,
	isActive: (editor: Editor) => editor.isActive('link'),
	run: (editor: Editor) =>
		editor
			.chain()
			.focus()
			.toggleLink(href ? { href } : undefined)
			.run(),
	canRun: (editor: Editor) =>
		editor
			.can()
			.chain()
			.focus()
			.toggleLink(href ? { href } : undefined)
			.run(),
})

const createImageOption = (props: SetImageOptions) => ({
	name: 'Image',
	shortcut: 'ctrl+shift+i',
	icon: Image,
	isActive: (editor: Editor) => editor.isActive('image'),
	run: (editor: Editor) => editor.chain().focus().setImage(props).run(),
	canRun: (editor: Editor) =>
		editor.can().chain().focus().setImage(props).run(),
})

export {
	AdvancedParagraphOptions,
	AlignOptions,
	createColorOption,
	createFontFamilyOption,
	createHighlightOption,
	ListOptions,
	MarkOptions,
	MiscOptions,
	ParagraphOptions,
	RemoveFormattingOption,
	SubSuperScriptOptions,
	UndoRedoOptions,
	createLinkUnlinkOption,
	createImageOption,
}
