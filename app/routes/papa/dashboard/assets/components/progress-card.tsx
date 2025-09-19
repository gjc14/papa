/**
 * Display progress cards for file uploads. Tracking upload progress.
 */
import { useState } from 'react'

import { Check, ChevronsUpDown, X } from 'lucide-react'

import { AnimatedCircularProgressBar } from '~/components/ui/animated-circular-progress-bar'
import { Button } from '~/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '~/components/ui/collapsible'

import type { UploadState } from '../utils'

export const ProgressCard = ({
	uploadProgress,
}: {
	uploadProgress: UploadState
}) => {
	const [hiddenProgressCards, setHiddenProgressCards] = useState<Set<string>>(
		new Set(),
	)
	const visibleUploadProgress = Object.entries(uploadProgress).filter(
		([key]) => !hiddenProgressCards.has(key),
	)

	if (visibleUploadProgress.length === 0) {
		return null
	}
	return (
		<Collapsible
			className="absolute right-3 bottom-3 space-y-2 md:w-[300px]"
			defaultOpen
			onClick={e => e.stopPropagation()}
		>
			{/* Upload progress card */}
			<CollapsibleTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="bg-muted flex w-full items-center justify-between space-x-4 border px-4 py-0"
					onClick={e => e.stopPropagation()}
				>
					<h4 className="text-sm font-semibold">
						{visibleUploadProgress.length}{' '}
						{visibleUploadProgress.length > 1 ? 'files' : 'file'} created
					</h4>
					<ChevronsUpDown className="h-4 w-4" />
					<span className="sr-only">Toggle</span>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="space-y-2">
				{visibleUploadProgress.map(([key, upload]) => {
					const { file, progress, status, error } = upload

					return (
						<div
							key={key}
							className="bg-muted flex items-center rounded-md border px-5 py-3.5"
						>
							<div className="min-w-0 flex-1 pr-3">
								{/* File name */}
								<div
									className="flex items-center justify-start gap-0"
									title={`${file}`}
								>
									<span className="mr-1 truncate text-sm font-medium">
										{file.name.split('.')[0]}
									</span>
									<span className="shrink-0 text-sm font-medium">
										.{file.name.split('.')[1]}
									</span>
								</div>

								{/* Error message */}
								{error && (
									<p className="text-destructive mt-1 text-sm/tight font-medium">
										{error}
									</p>
								)}
							</div>

							<div className="flex shrink-0 items-center">
								{status === 'completed' ? (
									<Button
										variant="outline"
										size="icon"
										className="border-primary group h-5 w-5 rounded-full border-0 bg-lime-500 p-0 transition-colors duration-200 hover:border hover:bg-transparent dark:bg-lime-600 dark:hover:bg-transparent"
										onClick={e => {
											e.stopPropagation()
											setHiddenProgressCards(prev => {
												const newSet = new Set(prev)
												newSet.add(key)
												return newSet
											})
										}}
									>
										<Check className="h-3 w-3 group-hover:hidden" />
										<X className="hidden h-3 w-3 group-hover:block" />
										<span className="sr-only">
											{status === 'completed'
												? 'Mark as incomplete'
												: 'Mark as complete'}
										</span>
									</Button>
								) : status === 'error' ? (
									<Button
										variant="outline"
										size="icon"
										className="border-primary group h-5 w-5 rounded-full border-0 bg-red-500 p-0 transition-colors duration-200 hover:border hover:bg-transparent dark:bg-red-600 dark:hover:bg-transparent"
										onClick={e => {
											e.stopPropagation()
											setHiddenProgressCards(prev => {
												const newSet = new Set(prev)
												newSet.add(key)
												return newSet
											})
										}}
									>
										<X className="h-3 w-3" />
										<span className="sr-only">{status}</span>
									</Button>
								) : (
									<div className="border-muted relative h-5 w-5 rounded-full border-2">
										<AnimatedCircularProgressBar
											className="flex h-full w-full animate-pulse items-center justify-center text-xs"
											max={105}
											min={0}
											value={progress}
											showPercent={false}
											strokeWidth={15}
											gaugePrimaryColor="rgb(79 70 229)"
											gaugeSecondaryColor="rgba(200, 200, 200, 1)"
										/>
									</div>
								)}
							</div>
						</div>
					)
				})}
			</CollapsibleContent>
		</Collapsible>
	)
}
