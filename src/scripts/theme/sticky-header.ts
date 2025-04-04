import { scaleValue } from '@/scripts/core/global'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type PredictiveSearch } from '@/scripts/optional/predictive-search'
import { type DetailsModal } from '@/scripts/theme/details-modal'
import { type HeaderMenu } from '@/scripts/theme/header-menu'
import { UcoastEl } from '@/scripts/core/UcoastEl'
import { SELECTORS } from '@/scripts/core/global'

export class StickyHeader extends UcoastEl {
	static htmlSelector = 'sticky-header'
	preventHide: boolean = false
	preventReveal: boolean = false
	header: HTMLElement
	headerIsAlwaysSticky?: boolean
	headerBounds: DOMRect | {} = {}
	currentScrollTop: number = 0
	predictiveSearch?: PredictiveSearch
	onScrollHandler!: (event: Event) => void
	hideHeaderOnScrollUp!: () => void
	searchModal?: DetailsModal
	isScrolling?: number
	disclosures?: [] | NodeListOf<HeaderMenu>
	constructor() {
		super()
		this.header = q.rs(SELECTORS.sectionHeader)
	}

	override connectedCallback() {
		this.header = q.rs(SELECTORS.sectionHeader)
		this.headerIsAlwaysSticky =
			this.getAttribute('data-sticky-type') === 'always' ||
			this.getAttribute('data-sticky-type') === 'reduce-logo-size'
		this.headerBounds = {}

		this.setHeaderHeight()

		window
			.matchMedia('(max-width: 990px)')
			.addEventListener('change', this.setHeaderHeight.bind(this))

		if (this.headerIsAlwaysSticky && this.header) {
			this.header.classList.add('shopify-section-header-sticky')
		}

		this.currentScrollTop = 0
		this.preventReveal = false
		this.predictiveSearch = q.os<PredictiveSearch>(
			'predictive-search',
			this
		)

		this.onScrollHandler = this.onScroll.bind(this)
		this.hideHeaderOnScrollUp = () => (this.preventReveal = true)

		this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp)
		window.addEventListener('scroll', this.onScrollHandler, false)

		this.createObserver()
	}

	setHeaderHeight() {
		if (!this.header) throw new Error('no header element found')
		const viewport = window.innerWidth >= 750 ? 'desktop' : 'mobile'
		document.documentElement.style.setProperty(
			'--header-height',
			`calc(${scaleValue(this.header.offsetHeight, viewport)} * var(--ax))`
		)
	}

	override disconnectedCallback() {
		this.removeEventListener(
			'preventHeaderReveal',
			this.hideHeaderOnScrollUp
		)
		window.removeEventListener('scroll', this.onScrollHandler)
	}

	createObserver() {
		let observer = new IntersectionObserver((entries, observer) => {
			this.headerBounds = entries[0].intersectionRect
			observer.disconnect()
		})

		observer.observe(this.header)
	}

	onScroll() {
		const scrollTop =
			window.pageYOffset || document.documentElement.scrollTop

		if (this.predictiveSearch && this.predictiveSearch.isOpen) return

		if (
			this.headerBounds instanceof DOMRectReadOnly &&
			scrollTop > this.currentScrollTop &&
			scrollTop > this.headerBounds.bottom
		) {
			this.header.classList.add('scrolled-past-header')
			if (this.preventHide) return
			requestAnimationFrame(this.hide.bind(this))
		} else if (
			this.headerBounds instanceof DOMRectReadOnly &&
			scrollTop < this.currentScrollTop &&
			scrollTop > this.headerBounds.bottom
		) {
			this.header.classList.add('scrolled-past-header')
			if (!this.preventReveal) {
				requestAnimationFrame(this.reveal.bind(this))
			} else {
				window.clearTimeout(this.isScrolling)

				this.isScrolling = setTimeout(() => {
					this.preventReveal = false
				}, 66)

				requestAnimationFrame(this.hide.bind(this))
			}
		} else if (
			this.headerBounds instanceof DOMRectReadOnly &&
			scrollTop <= this.headerBounds.top
		) {
			this.header.classList.remove('scrolled-past-header')
			requestAnimationFrame(this.reset.bind(this))
		} else if (!(this.headerBounds instanceof DOMRectReadOnly)) {
			console.warn(
				'onScroll used in sticky-header but headerBounds is not initialized'
			)
			console.log('headerBounds', this.headerBounds)
		}

		this.currentScrollTop = scrollTop
	}

	hide() {
		if (this.headerIsAlwaysSticky) return
		this.header.classList.add(
			'shopify-section-header-hidden',
			'shopify-section-header-sticky'
		)
		this.closeMenuDisclosure()
		this.closeSearchModal()
	}

	reveal() {
		if (this.headerIsAlwaysSticky) return
		this.header.classList.add('shopify-section-header-sticky', 'animate')
		this.header.classList.remove('shopify-section-header-hidden')
	}

	reset() {
		if (this.headerIsAlwaysSticky) return
		this.header.classList.remove(
			'shopify-section-header-hidden',
			'shopify-section-header-sticky',
			'animate'
		)
	}

	closeMenuDisclosure() {
		this.disclosures =
			this.disclosures ||
			q.ol<HeaderMenu>('header-menu', this.header)
		this.disclosures?.forEach((disclosure) => {
			disclosure.close()
		})
	}

	closeSearchModal() {
		this.searchModal =
			this.searchModal ??
			q.rs<DetailsModal>('details-modal', this.header)
		this.searchModal.close(false)
	}
}
