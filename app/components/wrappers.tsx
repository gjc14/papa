import { cn } from "~/lib/utils"

/**
 * Wrapper for the main content of the page. Make page has minimum height of the screen and align-items: center.
 * You could easily make children fill the page by adding `grow` class to the children.
 */
export const MainWrapper = ({
	children,
	className,
}: {
	children?: React.ReactNode
	className?: string
}) => {
	return (
		<main
			className={cn(
				"flex h-full min-h-svh w-full flex-col items-center",
				className,
			)}
		>
			{children}
		</main>
	)
}
