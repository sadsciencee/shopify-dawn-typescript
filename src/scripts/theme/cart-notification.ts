import {
	ATTRIBUTES,
	closestOptional,
	qsRequired,
	targetClosestOptional,
	targetRequired
} from '@/scripts/core/global';
import { type StickyHeader } from '@/scripts/theme/sticky-header'
import { removeTrapFocus, trapFocus } from '@/scripts/core/global'
import { type ShopifySectionRenderingSchema } from '@/scripts/types/theme'
import { UcoastEl } from '@/scripts/core/UcoastEl'
import { SELECTORS } from '@/scripts/core/global'
import {
	CartAddWithSections,
	renderRawHTMLToDOM,
} from '@/scripts/core/cart-functions'

export class CartNotification extends UcoastEl {
	static htmlSelector = 'cart-notification'
	static selectors = {
		notification: '[data-uc-cart-notification]',
		closeButton: '[data-uc-cart-notification-close]',
	}
	notification: HTMLElement
	header: StickyHeader
	onBodyClick: (event: MouseEvent) => void
	activeElement?: HTMLElement
	sectionApiIds = ['cart-notification-product', 'cart-icon-bubble','cart-notification-button']
	constructor() {
		super()

		this.notification = qsRequired(CartNotification.selectors.notification)
		this.header = qsRequired('sticky-header')
		this.onBodyClick = this.handleBodyClick.bind(this)

		this.notification.addEventListener(
			'keyup',
			(event) => event.code === 'Escape' && this.close()
		)
		this.querySelectorAll(CartNotification.selectors.closeButton).forEach((closeButton) =>
			closeButton.addEventListener('click', this.close.bind(this))
		)
	}

	open() {
		this.notification.classList.add('animate', 'active')

		this.notification.addEventListener(
			'transitionend',
			() => {
				this.notification.focus()
				trapFocus(this.notification)
			},
			{ once: true }
		)

		document.body.addEventListener('click', this.onBodyClick)
	}

	close() {
		this.notification.classList.remove('active')
		document.body.removeEventListener('click', this.onBodyClick)

		removeTrapFocus(this.activeElement)
	}

	renderContents(cart: CartAddWithSections) {
		this.setActiveElement(document.activeElement)
		this.getSectionsToRender().forEach((section) => {
			const sectionId = section.id
			if (!sectionId) throw new Error('Section id is required')
			renderRawHTMLToDOM({
				sourceHTML: cart.sections[sectionId],
				sourceSelector: section.selector,
				destinationSelector: section.selector,
			})
		})

		if (cart.items.length) {
			this.removeAttribute(ATTRIBUTES.cartEmpty)
		} else {
			this.setAttribute(ATTRIBUTES.cartEmpty, '')
		}

		if (this.header) this.header.reveal()
		this.open()
	}

	getSectionsToRender(): ShopifySectionRenderingSchema[] {
		return [
			{
				id: 'cart-notification-product',
				selector: `#cart-notification-product`,
			},
			{
				id: 'cart-notification-button',
				selector: '#cart-notification-button'
			},
			{
				id: 'cart-icon-bubble',
				selector: SELECTORS.cartLink,
			},
		]
	}

	handleBodyClick(event: MouseEvent) {
		const target = targetRequired(event)
		const closestCartNotification = closestOptional<CartNotification>(
			target,
			'cart-notification'
		)
		if (target !== this.notification && !closestCartNotification) {
			const disclosure = targetClosestOptional(event, 'details-disclosure, header-menu')
			this.activeElement = disclosure ? qsRequired('summary', disclosure) : undefined
			this.close()
		}
	}

	setActiveElement(element: Element | null) {
		if (!element) throw new Error('Active element is required')
		this.activeElement = element as HTMLElement
	}
}

customElements.define('cart-notification', CartNotification)
