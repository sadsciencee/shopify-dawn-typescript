import { qsOptional } from '@/scripts/functions';
import { PredictiveSearch } from '@/scripts/catalog/predictive-search';

export class StickyHeader extends HTMLElement {
	preventHide: boolean = false
  preventReveal: boolean = false
	header?: HTMLElement
	headerIsAlwaysSticky?: boolean
	headerBounds?: DOMRect | {}
	currentScrollTop: number = 0
	predictiveSearch?: PredictiveSearch
  onScrollHandler?: EventListener
  hideHeaderOnScrollUp?: () => void
	constructor() {
		super()
	}

	connectedCallback() {
		this.header = qsOptional('.section-header')
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
		this.predictiveSearch = qsOptional<PredictiveSearch>('predictive-search', this)

		this.onScrollHandler = this.onScroll.bind(this)
		this.hideHeaderOnScrollUp = () => (this.preventReveal = true)

		this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp)
		window.addEventListener('scroll', this.onScrollHandler, false)

		this.createObserver()
	}

	setHeaderHeight() {
    if (!this.header) throw new Error('no header element found')
		document.documentElement.style.setProperty(
			'--header-height',
			`${this.header.offsetHeight}px`
		)
	}

	disconnectedCallback() {
		this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp)
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
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop

		if (this.predictiveSearch && this.predictiveSearch.isOpen) return

		if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
			this.header.classList.add('scrolled-past-header')
			if (this.preventHide) return
			requestAnimationFrame(this.hide.bind(this))
		} else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
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
		} else if (scrollTop <= this.headerBounds.top) {
			this.header.classList.remove('scrolled-past-header')
			requestAnimationFrame(this.reset.bind(this))
		}

		this.currentScrollTop = scrollTop
	}

	hide() {
		if (this.headerIsAlwaysSticky) return
		this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky')
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
		this.disclosures = this.disclosures || this.header.querySelectorAll('header-menu')
		this.disclosures.forEach((disclosure) => disclosure.close())
	}

	closeSearchModal() {
		this.searchModal = this.searchModal || this.header.querySelector('details-modal')
		this.searchModal.close(false)
	}
}
