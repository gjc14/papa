import { cn } from '.'

// Helper function to render different types of logos
export const renderServiceLogo = ({
	logo,
	size = 'base',
	className,
}: {
	logo: React.ComponentType<React.SVGProps<SVGSVGElement>> | string
	/** sm: size-3, base: size-5, lg: size-7 */
	size?: 'sm' | 'lg' | 'base'
	className?: string
}) => {
	// If it's a string, treat it as an image URL or SVG path
	if (typeof logo === 'string') {
		return (
			<img
				src={logo}
				alt="logo"
				className={cn(
					'object-cover',
					size === 'sm' ? 'size-3' : size === 'base' ? 'size-5' : 'size-7',
					className,
				)}
			/>
		)
	}

	// If it's svg
	const LogoComponent = logo
	return (
		<LogoComponent
			className={cn(
				'text-foreground',
				size === 'sm' ? 'size-3' : size === 'base' ? 'size-5' : 'size-7',
				className,
			)}
		/>
	)
}
