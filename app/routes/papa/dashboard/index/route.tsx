import { DashboardSectionWrapper } from '~/routes/papa/dashboard/components/dashboard-wrapper'

export default function DashboardIndex() {
	return (
		<DashboardSectionWrapper>
			<h2>Dashboard</h2>
			<div className="w-full h-80 border border-border rounded-md" />
			<div className="flex flex-row gap-5 w-full">
				<div className="h-60 w-1/2 rounded-md border border-border " />
				<div className="h-60 w-1/2 rounded-md border border-border " />
			</div>
		</DashboardSectionWrapper>
	)
}
