import { cn } from '~/lib/utils'

const DashboardLayout = ({
	children,
	className,
}: {
	children?: React.ReactNode
	className?: string
}) => {
	return (
		<div
			data-slot="dashboard-wrapper"
			className={cn(
				'relative flex h-min w-full flex-1 flex-col gap-2 overflow-hidden md:gap-3',
				className,
			)}
		>
			{children}
		</div>
	)
}

const DashboardHeader = ({
	children,
	className,
}: {
	children?: React.ReactNode
	className?: string
}) => {
	return (
		<div
			data-slot="dashboard-header"
			className={cn(
				'flex flex-wrap items-center justify-between gap-3 px-3 pt-2 md:px-5 md:pt-3',
				className,
			)}
		>
			<>{children}</>
		</div>
	)
}

const DashboardTitle = ({
	className,
	title,
	titleClassName,
	description,
	descriptionClassName,
	children,
}: {
	className?: string
	title?: string
	titleClassName?: string
	description?: string
	descriptionClassName?: string
	children?: React.ReactNode
}) => {
	return (
		<div data-slot="dashboard-title" className={cn('space-y-2', className)}>
			{title && <h2 className={titleClassName}>{title}</h2>}
			{description && (
				<p
					className={cn('text-muted-foreground text-sm', descriptionClassName)}
				>
					{description}
				</p>
			)}
			{children}
		</div>
	)
}

const DashboardActions = ({
	children,
	className,
}: {
	children?: React.ReactNode
	className?: string
}) => {
	return (
		<div
			data-slot="dashboard-actions"
			className={cn('flex flex-nowrap items-center gap-2', className)}
		>
			{children}
		</div>
	)
}

const DashboardContent = ({
	children,
	className,
}: {
	children?: React.ReactNode
	className?: string
}) => {
	return (
		<div
			data-slot="dashboard-content"
			className={cn(
				'flex w-full flex-1 gap-2 overflow-auto px-3 md:px-5',
				className,
			)}
		>
			{children}
		</div>
	)
}

export {
	DashboardActions,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
	DashboardContent,
}
