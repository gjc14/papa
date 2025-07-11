export interface Page {
	name: string
	url: string
	soon?: boolean
}

export const Footer = () => {
	return (
		<footer className="w-full py-3 px-6 mt-auto flex flex-col-reverse items-center justify-center gap-2 lg:flex-row lg:gap-8 border-t">
			<p className="text-sm text-primary">
				Built somewhere on the 🌏. © {new Date().getFullYear()}{' '}
				<a
					href="https://papa.cloud"
					aria-label="Go to papa"
					target="_blank"
					rel="noopener noreferrer"
					title="Go to the Papa website"
					className="hover:underline"
				>
					Papa
				</a>
			</p>
		</footer>
	)
}
