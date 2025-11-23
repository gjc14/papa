import { useAtomValue } from 'jotai'

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '~/components/ui/resizable'

import { Header } from '../../../store/layout/components/header'
import { StoreProductPage } from '../../../store/product/page'
import { ProductAlerts } from './components/alerts'
import { Attributes } from './components/attributes'
import { Gallery } from './components/gallery'
import { GeneralInformation } from './components/general-information'
import { ProductEditPageHeader } from './components/header'
import { Instructions } from './components/instruction'
import { LinkedProducts } from './components/linked-products'
import { MainOption } from './components/main-option'
import { Publishing } from './components/publishing'
import { Seo } from './components/seo'
import { Taxonomies } from './components/taxonomies'
import { Variants } from './components/variants'
import { livePreviewAtom } from './context'

export function ProductEditPage() {
	const livePreview = useAtomValue(livePreviewAtom)

	return (
		<ResizablePanelGroup direction="horizontal">
			<ProductAlerts />
			<ResizablePanel
				className="@container"
				defaultSize={livePreview ? 50 : 100}
				minSize={30}
				id="edit-panel"
				order={0}
			>
				<section className="relative h-full w-full overflow-auto">
					{/* Sticky Header */}
					<ProductEditPageHeader />

					<div className="p-4">
						<div className="grid grid-cols-1 gap-6 @xl:grid-cols-5">
							{/* Left Column */}
							<div className="space-y-6 @xl:col-span-3">
								<GeneralInformation />
								<Instructions />
								<MainOption />
								{/* Specifications / Options */}
								<Attributes />
								<Variants />
								<LinkedProducts />
							</div>

							{/* Right Column */}
							<div className="space-y-6 @xl:col-span-2">
								<Publishing />
								<Gallery />
								<Taxonomies />
								<Seo />
							</div>
						</div>
					</div>
				</section>
			</ResizablePanel>

			{livePreview && (
				<>
					<ResizableHandle />
					<ResizablePanel
						className="@container"
						defaultSize={50}
						minSize={30}
						id="dynamic-preview-panel"
						order={1}
					>
						<section className="h-full w-full overflow-auto">
							<Header />
							<StoreProductPage />
						</section>
					</ResizablePanel>
				</>
			)}
		</ResizablePanelGroup>
	)
}
