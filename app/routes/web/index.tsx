import { Link } from 'react-router'

import { Button } from '~/components/ui/button'

export default function WebIndex() {
	return (
		<div className="flex h-svh flex-1 flex-col items-center justify-center">
			<p className="p-5">Welcome to ButterEMS. Modern EMS for SMEs.</p>
			<Button variant={'link'}>
				<Link to="/blog">{'Blog >'}</Link>
			</Button>
			<Button variant={'link'}>
				<Link to="/store">{'Store >'}</Link>
			</Button>
		</div>
	)
}
