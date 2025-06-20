import { useState } from 'react'
import { useNavigate } from 'react-router'

import {
	AdminActions,
	AdminContent,
	AdminHeader,
	AdminSectionWrapper,
	AdminTitle,
} from '../../components/admin-wrapper'
import type { Route } from './+types/route'

export const action = async ({ request, params }: Route.ActionArgs) => {
	return {}
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
	return {}
}

export default function Campaign({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const navigate = useNavigate()
	const [data, setData] = useState()

	return (
		<AdminSectionWrapper>
			<AdminHeader>
				<AdminTitle title="Email Campaign"></AdminTitle>
				<AdminActions>{/* You may put some buttons here */}</AdminActions>
			</AdminHeader>
			<AdminContent>
				<button onClick={() => navigate('123')}>Edit!</button>
			</AdminContent>
		</AdminSectionWrapper>
	)
}
