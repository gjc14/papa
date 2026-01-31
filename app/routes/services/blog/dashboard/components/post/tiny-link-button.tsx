export const TinyLinkButton = ({
	title = 'Generate',
	onClick,
}: {
	title?: string
	onClick: () => void
}) => {
	return (
		<button
			type="button"
			className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer text-xs underline"
			onClick={onClick}
		>
			{title}
		</button>
	)
}
