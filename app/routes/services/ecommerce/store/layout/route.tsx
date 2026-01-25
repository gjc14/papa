import { Outlet } from 'react-router'

import { MainWrapper } from '~/components/wrappers'

import { Header } from './components/header'

export default function StoreLayout() {
	return (
		<MainWrapper>
			<Header />
			<Outlet />
		</MainWrapper>
	)
}
