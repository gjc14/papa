import React from 'react'

import { useInPageNavigation } from '~/hooks/use-in-page-navigation'

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

// Static sections definition
const SECTIONS = [
	{ id: 'general-information', label: 'General Information' },
	{ id: 'gallery', label: 'Gallery' },
	{ id: 'main-option', label: 'Product & Inventory' },
	{ id: 'attributes', label: 'Attributes' },
	{ id: 'variants', label: 'Variants' },
	{ id: 'instruction', label: 'Instruction' },
	{ id: 'linked-products', label: 'Linked Products' },
	{ id: 'taxonomies', label: 'Classification' },
	{ id: 'publishing', label: 'Publishing' },
	{ id: 'seo', label: 'SEO' },
]

export function ProductEditPage() {
	const {
		activeId,
		scrollDir,
		containerRef,
		DOWN_THRESHOLD_VH,
		UP_THRESHOLD_VH,
	} = useInPageNavigation({
		SECTIONS,
	})

	return (
		<>
			<ProductAlerts />

			<section
				ref={containerRef}
				className="relative h-full w-full overflow-auto"
			>
				{/* Sticky Header */}
				<ProductEditPageHeader />

				<div className="p-4">
					<div className="grid grid-cols-3 gap-6">
						{/* Left Column */}
						<div className="col-span-3 space-y-6 md:col-span-2">
							<GeneralInformation />
							<Gallery />
							<MainOption />

							<Attributes />
							<Variants />

							<Instructions />

							<LinkedProducts />

							{/* Classification */}
							<Taxonomies />

							{/* Publishing */}
							<Publishing />
							<Seo />

							{/* TODO: AEO GEO */}
						</div>

						{/* Right Column */}
						<div className="col-span-0 md:col-span-1">
							<Sidebar
								sections={SECTIONS}
								activeId={activeId}
								containerRef={containerRef}
							/>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

interface Section {
	id: string
	label: string
}

interface SidebarProps {
	sections: Section[]
	activeId: string
	containerRef: React.RefObject<HTMLDivElement | null>
}

const Sidebar: React.FC<SidebarProps> = ({
	sections,
	activeId,
	containerRef,
}) => {
	const handleLinkClick = (e: React.MouseEvent, id: string) => {
		e.preventDefault()
		const el = document.getElementById(id)
		const container = containerRef.current
		if (el && container) {
			const top =
				el.getBoundingClientRect().top -
				container.getBoundingClientRect().top +
				container.scrollTop -
				80
			container.scrollTo({ top, behavior: 'smooth' })
		}
	}

	return (
		<aside className="sticky top-20 z-5 hidden w-full flex-col overflow-y-auto border-r p-8 md:flex">
			<div className="mb-5 text-xs font-bold uppercase">On this page</div>
			<nav className="space-y-1">
				{sections.map(section => {
					return (
						<a
							key={section.id}
							href={`#${section.id}`}
							onClick={e => handleLinkClick(e, section.id)}
							className={`block truncate border-l-5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
								activeId === section.id
									? 'border-brand bg-muted text-primary'
									: 'text-muted-foreground hover:bg-muted hover:text-primary border-transparent'
							} `}
						>
							{section.label}
						</a>
					)
				})}
			</nav>
		</aside>
	)
}
