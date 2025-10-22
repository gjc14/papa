import { useState } from 'react'

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '~/components/ui/resizable'

import { Header } from '../../../store/layout/components/header'
import { StoreProductPage } from '../../../store/product/page'
import { Attributes } from './components/attributes'
import { Gallery } from './components/gallery'
import { GeneralInformation } from './components/general-information'
import { ProductEditPageHeader } from './components/header'
import { Instructions } from './components/instruction'
import { LinkedProducts } from './components/linked-products'
import { MainOption } from './components/main-option'
import { Publishing } from './components/publishing'
import { Taxonomies } from './components/taxonomies'
import { Variants } from './components/variants'

export function ProductEditPage() {
	const [preview, setPreview] = useState(false)

	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel
				className="@container"
				defaultSize={preview ? 50 : 100}
				minSize={30}
				id="edit-panel"
				order={0}
			>
				<section className="relative h-full w-full overflow-auto">
					{/* Sticky Header */}
					<ProductEditPageHeader
						preview={preview}
						onPreviewChange={setPreview}
					/>

					<div className="p-4">
						<p className="text-muted-foreground mb-4 rounded-lg border bg-violet-300/20 p-3 text-sm @xl:mb-6 dark:bg-violet-700/20">
							<strong>Instructions:</strong> Add attributes (options) to your
							product, and use them to generate variants. Use the preview panel
							to see how your product will appear to customers.
						</p>

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
								{/* TODO: SEO */}
							</div>

							{/* Right Column */}
							<div className="space-y-6 @xl:col-span-2">
								<Publishing />
								<Gallery />
								<Taxonomies />
							</div>
						</div>
					</div>
				</section>
			</ResizablePanel>

			{preview && (
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
