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
			className="text-muted-foreground hover:text-primary ml-2 cursor-pointer text-sm underline"
			onClick={onClick}
		>
			{title}
		</button>
	)
}
