export interface Page {
	name: string
	url: string
	soon?: boolean
}

export const Footer = () => {
	return (
		<footer className="mt-auto flex w-full flex-col-reverse items-center justify-center gap-2 border-t px-6 py-3 lg:flex-row lg:gap-8">
			<p className="text-foreground text-sm">
				Built somewhere on the 🌏. © {new Date().getFullYear()}{' '}
				<a
					href="https://github.com/gjc14/papa"
					aria-label="Go to project"
					target="_blank"
					rel="noopener noreferrer"
					title="Go to project"
					className="hover:underline"
				>
					Papa
				</a>
			</p>
		</footer>
	)
}
