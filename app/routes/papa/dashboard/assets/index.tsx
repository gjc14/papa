import { useEffect, useState } from 'react'
import { useLoaderData, useRevalidator } from 'react-router'

import { CloudAlert } from 'lucide-react'

import { Label } from '~/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import {
	DashboardActions,
	DashboardContent,
	DashboardHeader,
	DashboardLayout,
	DashboardTitle,
} from '~/components/dashboard/dashboard-wrapper'
import { capitalize } from '~/lib/utils'

import { FileGrid } from './components/file-grid'
import type { loader } from './resource'
import { MIMETypes } from './utils'

const displayOptions = ['all', 'file', ...MIMETypes]

export { loader } from './resource'

export default function DashboardAsset() {
	const { hasObjectStorage, files, origin } = useLoaderData<typeof loader>()
	const { revalidate } = useRevalidator()
	const [filesState, setFilesState] = useState(files)
	const [display, setDisplay] = useState<(typeof displayOptions)[number]>('all')

	const filesDisplayed =
		display === 'all'
			? filesState
			: filesState.filter(file => {
					if (display === 'file') {
						const fileGeneralType = file.type.split('/')[0]
						return ['application', 'model', 'font', 'text'].includes(
							fileGeneralType,
						)
					}
					const fileGeneralType = file.type.split('/')[0]
					return fileGeneralType === display
				})

	useEffect(() => {
		setFilesState(files)
	}, [files])

	return (
		<DashboardLayout>
			<DashboardHeader>
				<DashboardTitle
					title="Assets"
					description="Manage all your assets on Papa platform"
				/>
				<DashboardActions>
					<Label htmlFor="asset-filter">Filter by</Label>
					<Select
						defaultValue="all"
						onValueChange={v => {
							setDisplay(v)
						}}
					>
						<SelectTrigger id="asset-filter" className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{displayOptions.map(option => (
								<SelectItem key={option} value={option}>
									{capitalize(option)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</DashboardActions>
			</DashboardHeader>
			<DashboardContent className="mb-2 md:mb-3">
				{hasObjectStorage ? (
					<FileGrid
						files={filesDisplayed}
						onFileUpdate={fileMeta => {
							setFilesState(
								filesState.map(file =>
									file.id === fileMeta.id ? fileMeta : file,
								),
							)
						}}
						onFileDeleted={fileMeta => {
							setFilesState(filesState.filter(file => file.id !== fileMeta.id))
						}}
						onUpload={() => revalidate()}
						origin={origin}
					/>
				) : (
					<div className="flex h-full min-h-60 w-full grow flex-col items-center justify-center gap-3 rounded-xl border">
						<CloudAlert size={50} />
						<p className="max-w-sm text-center">
							Please setup your S3 Object Storage to start uploading assets
						</p>
					</div>
				)}
			</DashboardContent>
		</DashboardLayout>
	)
}
