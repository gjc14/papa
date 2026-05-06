import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyleKit } from "@tiptap/extension-text-style"
import { Typography } from "@tiptap/extension-typography"
import { Youtube } from "@tiptap/extension-youtube"
import { Placeholder, Selection } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"
import { common, createLowlight } from "lowlight"
// Custom Extensions
import { SmilieReplacer } from "./extensions/smilie-replacer"

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
			codeBlock: false,
			dropcursor: {
				width: 2,
			},
			link: {
				openOnClick: openOnClick,
				autolink: true,
				defaultProtocol: "https",
				protocols: ["https", "http", "mailto", "tel"],
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
		TextAlign.configure({ types: ["heading", "paragraph"] }),
		TextStyleKit.configure({}),
		CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
		Image,
		/** @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#settings */
		Youtube.extend({
			addOptions() {
				return {
					...this.parent?.(),
					width: "100%",
					height: 360,
				}
			},
		}),
		TaskList,
		TaskItem.configure({
			nested: true,
		}),

		// Plugins
		// SlashCommand,
		SmilieReplacer, // extends text node

		// Extensions
		Placeholder.configure({
			// placeholder: () => {
			// 	return 'Type "/" to open menu...'
			// },
		}),
		Selection, // Keep selection on editor blur
	]
}

export default ExtensionKit
