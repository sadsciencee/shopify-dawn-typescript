import { MenuDrawer } from '@/scripts/theme/menu-drawer'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { ATTRIBUTES, SELECTORS } from '@/scripts/core/global'

export class HeaderDrawer extends MenuDrawer {
	static override htmlSelector = 'header-drawer'
	static override selectors = {
		...MenuDrawer.selectors,
	}
	header?: HTMLElement
	borderOffset?: number
	constructor() {
		super()
	}

	override getInstanceSelectors() {
		this.instanceSelectors = HeaderDrawer.selectors
	}

	setHeader() {
		return this.header || q.rs(SELECTORS.sectionHeader)
	}

	setBorderOffset() {
		return this.borderOffset ||
			q.rs(SELECTORS.headerWrapper).dataset.ucHeaderWrapper == 'border-bottom'
			? 1
			: 0
	}

	override openMenuDrawer(summaryElement: HTMLElement) {
		this.header = this.setHeader()
		this.borderOffset = this.setBorderOffset()
		document.documentElement.style.setProperty(
			'--header-bottom-position',
			`${Math.round(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
		)
		this.header.setAttribute('data-uc-header-menu-open', '')

		setTimeout(() => {
			this.mainDetails.setAttribute(ATTRIBUTES.menuOpening, '')
		})

		summaryElement.setAttribute('aria-expanded', 'true')
		window.addEventListener('resize', this.onResize)
		window.TsDOM.trapFocus(this.mainDetails, summaryElement)
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
	}

	override closeMenuDrawer(
		event: Event | undefined,
		elementToFocus: HTMLElement | undefined = undefined
	) {
		if (!elementToFocus) return
		this.header = this.setHeader()
		super.closeMenuDrawer(event, elementToFocus)
		this.header.removeAttribute('data-uc-header-menu-open')
		window.removeEventListener('resize', this.onResize)
	}

	onResize = () => {
		if (!this.header) return
		this.borderOffset = this.setBorderOffset()
		document.documentElement.style.setProperty(
			'--header-bottom-position',
			`${Math.round(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
		)
		document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`)
	}
}
