import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Typography } from '@tiptap/extension-typography'
import { Placeholder } from '@tiptap/extensions'
import { StarterKit } from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'

import { ColorHighlighter } from './color-highlighter'
import { Youtube } from './responseive-youtube'
import { SmilieReplacer } from './smilie-replacer'

/**
 * ExtensionKit
 * @param openOnClick - Open link on click
 */
export const ExtensionKit = ({
	openOnClick = false,
}: {
	openOnClick?: boolean
} = {}) => {
	return [
		StarterKit.configure({
			heading: {
				levels: [2, 3, 4, 5],
			},
			codeBlock: false,
			dropcursor: {
				width: 2,
				class: 'ProseMirror-dropcursor border-black',
			},
			link: {
				openOnClick: openOnClick,
				autolink: true,
				defaultProtocol: 'https',
				validate: href => /^https?:\/\//.test(href),
			},
		}),

		// Marks
		Highlight.configure({
			multicolor: true,
		}),
		Superscript,
		Subscript,
		Typography, // Input rules, such as (c) -> © or >> -> »

		// Nodes
		Placeholder.configure({
			// placeholder: () => {
			// 	return 'Press "/" to open commands, "/ai" for continue writing'
			// },
		}),
		TextAlign.configure({ types: ['heading', 'paragraph'] }),
		TextStyleKit.configure({}),
		CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
		Image.configure({
			inline: true,
			HTMLAttributes: {
				class: 'inline-block',
			},
		}),
		Youtube.configure({
			inline: true,
		}),
		TaskList,
		TaskItem.configure({
			nested: true,
		}),

		// Plugins
		// SlashCommand,
		SmilieReplacer,
		ColorHighlighter,
	]
}

export default ExtensionKit
