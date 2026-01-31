import { Link, useNavigate } from 'react-router'

import {
	Bell,
	ChevronRight,
	CreditCard,
	LogOut,
	Shield,
	Sparkles,
	User2,
	type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
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
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '~/components/ui/sidebar'
import {
	CurrentThemeIcon,
	ThemeDropdownMenuSubTrigger,
} from '~/components/theme-toggle'
import { authClient } from '~/lib/auth/auth-client'
import type { Session } from '~/lib/auth/auth.server'

interface SidebarUserProps {
	user: Session['user']
}

export const SidebarUser = ({ user }: SidebarUserProps) => {
	const navigate = useNavigate()

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onRequest: () => {},
				onSuccess: () => {
					toast.success('Sign out successfully!')
					navigate('/')
				},
				onError: ctx => {
					console.error(ctx.error)
					toast.error('Error signing out: ' + ctx.error.message)
				},
			},
		})
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-md">
									<AvatarImage
										src={user.image || '/placeholders/avatar.png'}
										alt={user.name}
									/>
									<AvatarFallback>PA</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
								<ChevronRight className="ml-auto size-4" />
							</SidebarMenuButton>
						}
					/>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={'top'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user.image || '/placeholders/avatar.png'}
											alt={user.name}
										/>
										<AvatarFallback className="rounded-lg">PA</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{user.name}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<ActionButton
									icon={Sparkles}
									title="Upgrade to Pro"
									route="/dashboard/account/upgrade"
								/>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								{DefaultUserOptions.map(option => (
									<ActionButton key={option.title} {...option} />
								))}

								<ThemeDropdownMenuSubTrigger className="group flex cursor-pointer items-center gap-2">
									<CurrentThemeIcon className="size-4 transition-transform group-hover:rotate-[25deg] dark:group-hover:rotate-[25deg]" />
									Change Theme
								</ThemeDropdownMenuSubTrigger>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="group"
								render={
									<button
										className="flex w-full items-center gap-2"
										onClick={handleSignOut}
									>
										<LogOut
											size={16}
											className="transition-transform group-hover:translate-x-0.5"
										/>
										<p className="text-sm">Sign Out</p>
									</button>
								}
							/>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}

const DefaultUserOptions: ActionButtonProps[] = [
	{
		title: 'My Profile',
		icon: User2,
		route: '/dashboard/account',
	},
	{
		title: 'Billing',
		icon: CreditCard,
		route: '/dashboard/account/billing',
	},
	{
		title: 'Notification',
		icon: Bell,
		route: '/dashboard/account/notification',
	},
	{
		title: 'Security',
		icon: Shield,
		route: '/dashboard/account/security',
	},
]

interface ActionButtonProps {
	icon: LucideIcon
	title: string
	route?: string
}

const ActionButton = (props: ActionButtonProps) => {
	if (props.route) {
		return (
			<DropdownMenuItem
				className="group flex items-center gap-2"
				render={
					<Link to={props.route}>
						<props.icon
							size={16}
							className="transition-transform group-hover:rotate-[25deg]"
						/>
						<p className="text-sm">{props.title}</p>
					</Link>
				}
			/>
		)
	}
	return (
		<DropdownMenuItem
			className="group flex items-center gap-2"
			onClick={() => alert(props.title + ' not implemented')}
		>
			<props.icon
				size={16}
				className="transition-transform group-hover:rotate-[25deg]"
			/>
			<p className="text-sm">{props.title}</p>
		</DropdownMenuItem>
	)
}
