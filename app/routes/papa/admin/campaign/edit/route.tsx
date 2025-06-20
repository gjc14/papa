import type { Route } from './+types/route'

export const action = async ({ request, params }: Route.ActionArgs) => {
	return {}
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	const { id } = params
	return { id }
}

export default function CampaignEditor({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	return (
		<div>
			{/* Frontend Code here. */}
			<h1>Edit {loaderData.id}</h1>
		</div>
	)
}
