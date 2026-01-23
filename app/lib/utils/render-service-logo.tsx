// Helper function to render different types of logos
export const renderServiceLogo = (
	logo: React.ElementType | string,
	size?: 'sm' | 'lg',
) => {
	// If it's a string, treat it as an image URL or SVG path
	if (typeof logo === 'string') {
		const imageClasses =
			size === 'sm' ? 'size-6 object-cover' : 'size-8 object-cover'
		return <img src={logo} alt="Service logo" className={imageClasses} />
	}

	// If it's a React component (like Lucide icons)
	const LogoComponent = logo
	const iconClasses = size === 'sm' ? 'size-6 scale-70' : 'size-8 scale-80 p-1'
	return <LogoComponent className={iconClasses} />
}
