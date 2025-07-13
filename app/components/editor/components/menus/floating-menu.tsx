/**
 * Floating menu triggered when moved to new line.
 * @see https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu
 */
import React from 'react'

import { Editor, FloatingMenu } from '@tiptap/react'
import {
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	List,
	ListOrdered,
} from 'lucide-react'

import { Button, type ButtonProps } from '~/components/ui/button'

export const DefaultFloatingMenu = ({ editor }: { editor: Editor }) => {
	return (
		<FloatingMenu
			tippyOptions={{ duration: 100 }}
			editor={editor}
			className="bg-muted flex gap-0.5 rounded-md border p-1"
		>
			<ToggleButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				isActive={editor.isActive('heading', { level: 2 })}
			>
				<Heading2 size={16} />
			</ToggleButton>
			<ToggleButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				isActive={editor.isActive('heading', { level: 3 })}
			>
				<Heading3 size={16} />
			</ToggleButton>
			<ToggleButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
				isActive={editor.isActive('heading', { level: 4 })}
			>
				<Heading4 size={16} />
			</ToggleButton>
			<ToggleButton
				onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
				isActive={editor.isActive('heading', { level: 5 })}
			>
				<Heading5 size={16} />
			</ToggleButton>

			<ToggleButton
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				isActive={editor.isActive('orderedList')}
			>
				<ListOrdered size={16} />
			</ToggleButton>
			<ToggleButton
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				isActive={editor.isActive('bulletList')}
			>
				<List size={16} />
			</ToggleButton>
		</FloatingMenu>
	)
}

interface ToggleButtonProps extends ButtonProps {
	isActive?: boolean
}

export const ToggleButton = React.forwardRef<
	HTMLButtonElement,
	ToggleButtonProps
>(({ className, name, isActive, children, ...props }, ref) => {
	return (
		<Button
			ref={ref}
			type="button"
			size={'icon'}
			variant={'ghost'}
			className={`h-6 px-0 ${
				isActive ? 'bg-accent text-accent-foreground' : ''
			}`}
			{...props}
		>
			{children}
		</Button>
	)
})
