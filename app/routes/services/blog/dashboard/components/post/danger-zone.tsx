/**
 * Danger zone for post editer
 */
import { useAtom } from 'jotai'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

import { isDeleteAlertOpenAtom, postAtom } from '../../context'

export const DangerZone = () => {
	const [post] = useAtom(postAtom)
	const [, setIsDeleteAlertOpen] = useAtom(isDeleteAlertOpenAtom)

	if (!post || post.id === -1) {
		return null
	}

	return (
		<>
			<Separator />

			<div className="flex w-full flex-col border p-3">
				<h3>Delete this post</h3>
				<p className="my-2">This action cannot be undone. new value</p>

				<Button
					onClick={() => setIsDeleteAlertOpen(true)}
					variant={'destructive'}
				>
					Delete Post
				</Button>
			</div>
		</>
	)
}
