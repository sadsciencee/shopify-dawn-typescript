import { ShopifySectionRenderingSchema } from '@/scripts/types/theme'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { UcoastEl } from '@/scripts/core/UcoastEl'
import { ATTRIBUTES, SELECTORS } from '@/scripts/core/global'
import {
	CartAddWithSections,
	CartUpdateWithSections,
	renderRawHTMLToDOM,
	updateProgressBar,
} from '@/scripts/core/cart-functions'

export class CartDrawer extends UcoastEl {
	static htmlSelector = 'cart-drawer'
	static selectors = {
		overlay: '[data-uc-cart-drawer-overlay]',
		innerEmpty: '[data-uc-cart-drawer-inner-empty]',
		inner: '[data-uc-cart-drawer-inner]',
		container: '#CartDrawer',
		cartLink: '#CartIconBubble',
		closeButton: '[data-uc-cart-drawer-close-button]',
		noteSummary: '[data-uc-cart-note-summary]',
		noteDetails: '[data-uc-cart-note-details]',
	}
	activeElement?: HTMLElement
	constructor() {
		super()

		this.addEventListener(
			'keyup',
			(evt) => evt.code === 'Escape' && this.close()
		)
		this.getOverlay().addEventListener('click', this.close.bind(this))
		this.setHeaderCartIconAccessibility()
	}

	getOverlay() {
		return q.rs(CartDrawer.selectors.overlay, this)
	}

	setHeaderCartIconAccessibility() {
		const cartLink = q.rs(CartDrawer.selectors.cartLink)
		cartLink.setAttribute('role', 'button')
		cartLink.setAttribute('aria-haspopup', 'dialog')
		cartLink.addEventListener('click', (event) => {
			event.preventDefault()
			this.open(cartLink)
		})
		cartLink.addEventListener('keydown', (event) => {
			if (event.code?.toUpperCase() === 'SPACE') {
				event.preventDefault()
				this.open(cartLink)
			}
		})
	}

	open(triggeredBy?: HTMLElement) {
		if (triggeredBy) this.setActiveElement(triggeredBy)
		const cartDrawerNote = q.os(CartDrawer.selectors.noteSummary, this)
		if (cartDrawerNote && !cartDrawerNote.hasAttribute('role'))
			this.setSummaryAccessibility(cartDrawerNote)
		// here the animation doesn't seem to always get triggered. A timeout seem to help
		setTimeout(() => {
			this.classList.add('animate', 'active')
		}, 1)

		this.addEventListener(
			'transitionend',
			() => {
				const containerToTrapFocusOn = this.hasAttribute(
					ATTRIBUTES.cartEmpty
				)
					? q.rs(CartDrawer.selectors.innerEmpty, this)
					: q.rs(CartDrawer.selectors.container)
				const focusElement =
					q.os(CartDrawer.selectors.inner, this) ||
					q.rs(CartDrawer.selectors.closeButton, this)
				window.TsDOM.trapFocus(containerToTrapFocusOn, focusElement)
				void window.Ucoast.mediaManager.playAllInContainer(this)
			},
			{ once: true }
		)

		document.body.classList.add('overflow-hidden')
	}

	close() {
		this.classList.remove('active')
		window.TsDOM.removeTrapFocus(this.activeElement)
		document.body.classList.remove('overflow-hidden')
	}

	setSummaryAccessibility(cartDrawerNote: HTMLElement) {
		const parentElement = cartDrawerNote.parentElement
		if (!parentElement)
			throw new Error(
				'setSummaryAccessibility failed - No parent element found'
			)
		cartDrawerNote.setAttribute('role', 'button')
		cartDrawerNote.setAttribute('aria-expanded', 'false')
		const nextElementSibling = cartDrawerNote.nextElementSibling

		if (
			nextElementSibling instanceof HTMLElement &&
			nextElementSibling.hasAttribute('id')
		) {
			cartDrawerNote.setAttribute('aria-controls', nextElementSibling.id)
		}

		cartDrawerNote.addEventListener('click', (event: MouseEvent) => {
			const currentTarget = q.rct(event)
			const isExpanded = q
				.rs(CartDrawer.selectors.noteDetails, this)
				.hasAttribute('open')
			currentTarget.setAttribute('aria-expanded', `${isExpanded}`)
		})

		parentElement.addEventListener('keyup', q.onKeyUpEscape)
	}

	renderContents(cart: CartAddWithSections | CartUpdateWithSections) {
		this.setActiveElement(document.activeElement)
		this.getSectionsToRender().forEach((section) => {
			if (section.section === 'dynamic-progress-bar') {
				updateProgressBar(cart.sections[section.section])
				return
			}
			const sectionHandle = section.section
			if (!sectionHandle) throw new Error('Section id is required')
			console.log('rendering section', {
				sectionHandle,
				selector: section.selector,
				id: section.id,
			})
			console.log('sections', cart.sections)
			renderRawHTMLToDOM({
				sourceHTML: cart.sections[sectionHandle],
				sourceSelector: section.selector,
				destinationSelector: section.selector,
				destinationSelectorContainer: `#${section.id}`,
			})
		})

		setTimeout(() => {
			this.getOverlay().addEventListener('click', this.close.bind(this))
			this.open()
			if (cart.items.length) {
				this.removeAttribute(ATTRIBUTES.cartEmpty)
			} else {
				this.setAttribute(ATTRIBUTES.cartEmpty, '')
			}
			void window.Ucoast.mediaManager.playAllInContainer(this)
		}, 1)
	}

	getSectionsToRender(): ShopifySectionRenderingSchema[] {
		return [
			{
				id: 'CartDrawer',
				section: 'cart-drawer-items',
				selector: 'cart-drawer-items',
			},
			{
				id: 'CartIconBubble',
				section: 'cart-icon-bubble',
				selector: SELECTORS.cartLink,
			},
			{
				id: 'CartDrawer',
				section: 'dynamic-progress-bar',
				selector: 'dynamic-progress-bar',
			},
			{
				id: 'CartDrawer',
				section: 'dynamic-cart-footer',
				selector: '.drawer__footer',
			},
		]
	}

	setActiveElement(element: Element | null) {
		if (!element) throw new Error('Active element is required')
		this.activeElement = element as HTMLElement
	}
}
