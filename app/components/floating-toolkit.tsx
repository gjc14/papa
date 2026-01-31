import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

import {
	ChevronUp,
	HelpCircle,
	LayoutDashboard,
	LogOut,
	PanelTop,
	PencilLine,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
	CurrentThemeIcon,
	ThemeDropdownMenuSubTrigger,
} from '~/components/theme-toggle'
import { authClient } from '~/lib/auth/auth-client'

type ToolkitPosition = 'right' | 'left' | 'center'

function getPositionClass(position: ToolkitPosition) {
	switch (position) {
		case 'left':
			return 'fixed left-6 bottom-6'
		case 'center':
			return 'fixed left-1/2 bottom-6 -translate-x-1/2'
		case 'right':
		default:
			return 'fixed right-6 bottom-6'
	}
}

const TOOLKIT_POSITION_COOKIE = 'toolkit-position'
const TOOLKIT_POSITION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export function FloatingToolkit() {
	const [position, setPosition] = useState<ToolkitPosition>(() => {
		if (typeof document === 'undefined') return 'right'

		const match = document.cookie
			.split('; ')
			.find(row => row.startsWith(`${TOOLKIT_POSITION_COOKIE}=`))

		const value = match?.split('=')[1]

		if (value === 'left' || value === 'center' || value === 'right') {
			return value
		}

		return 'right'
	})

	const navigate = useNavigate()
	const { data } = authClient.useSession()

	const setPositionWithCookie = useCallback(
		(value: ToolkitPosition | ((v: ToolkitPosition) => ToolkitPosition)) => {
			const next = typeof value === 'function' ? value(position) : value

			setPosition(next)

			document.cookie = `${TOOLKIT_POSITION_COOKIE}=${next}; path=/; max-age=${TOOLKIT_POSITION_COOKIE_MAX_AGE}`
		},
		[position],
	)

	if (data?.user.role !== 'admin') return null

	return (
		<div className={`${getPositionClass(position)} z-99999`}>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button size={'icon'} className="size-7">
							<ChevronUp />
						</Button>
					}
				/>

				<DropdownMenuContent align="start" side="top" className="mb-2 w-64">
					<DropdownMenuGroup>
						<DropdownMenuLabel>Quick Toolkit</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => navigate('/')}>
							<PanelTop className="mr-2 size-4" />
							<span>View Website</span>
						</DropdownMenuItem>

						<DropdownMenuItem onClick={() => navigate('/dashboard')}>
							<LayoutDashboard className="mr-2 size-4" />
							<span>Go to Dashboard</span>
						</DropdownMenuItem>

						<DropdownMenuItem onClick={() => navigate('/dashboard/blog/new')}>
							<PencilLine className="mr-2 size-4" />
							<span>New Post</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() =>
								window.open(
									'https://github.com/gjc14/papa/discussions',
									'_blank',
									'noopener,noreferrer',
								)
							}
						>
							<HelpCircle className="mr-2 size-4" />
							<span>Help & Resources</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<ThemeDropdownMenuSubTrigger className="cursor-pointer">
							<CurrentThemeIcon className="mr-2 size-4" />
							Change Theme
						</ThemeDropdownMenuSubTrigger>

						{/* Position toggle */}
						<DropdownMenuSeparator />

						<div className="grid grid-cols-3 gap-1.5 p-2">
							<Button
								type="button"
								variant={position === 'left' ? 'default' : 'outline'}
								size="sm"
								className="h-7"
								onClick={() => setPositionWithCookie('left')}
							>
								Left
							</Button>
							<Button
								type="button"
								variant={position === 'center' ? 'default' : 'outline'}
								size="sm"
								className="h-7"
								onClick={() => setPositionWithCookie('center')}
							>
								Center
							</Button>
							<Button
								type="button"
								variant={position === 'right' ? 'default' : 'outline'}
								size="sm"
								className="h-7"
								onClick={() => setPositionWithCookie('right')}
							>
								Right
							</Button>
						</div>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => authClient.signOut()}>
							<LogOut className="mr-2 size-4" />
							<span>Sign Out</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
