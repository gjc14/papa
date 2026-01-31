import { Link, NavLink } from 'react-router'

import { Menu } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/ui/sheet'

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
	{ href: '/', label: 'Home' },
	{ href: '/store', label: 'Store' },
	{ href: '/blog', label: 'Blog' },
]

export function Header() {
	return (
		<header className="supports-[backdrop-filter]:bg-background/50 bg-background sticky top-0 z-10 w-full border-b px-4 backdrop-blur-md md:px-6">
			<div className="flex h-16 items-center justify-between">
				{/* Logo */}
				<div className="flex items-center">
					<Link to="/" className="text-xl font-bold">
						Logo
					</Link>
				</div>

				<nav className="hidden items-center space-x-6 md:flex">
					{navigationLinks.map(link => (
						<NavLink
							key={link.href}
							to={link.href}
							className={({ isActive }) =>
								`hover:text-foreground text-sm font-medium transition-colors ${
									isActive ? 'text-foreground' : 'text-muted-foreground'
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</nav>

				<div className="md:hidden">
					<Sheet>
						<SheetTrigger
							render={
								<Button variant="ghost" size="icon-sm">
									<Menu />
									<span className="sr-only">Toggle menu</span>
								</Button>
							}
						/>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Navigation</SheetTitle>
							</SheetHeader>
							<nav className="mt-6 flex flex-col space-y-4">
								{navigationLinks.map(link => (
									<NavLink
										key={link.href}
										to={link.href}
										className={({ isActive }) =>
											`hover:text-foreground mx-auto text-lg font-medium transition-colors ${
												isActive ? 'text-foreground' : 'text-muted-foreground'
											}`
										}
									>
										{link.label}
									</NavLink>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	)
}
