import { ATTRIBUTES, ON_CHANGE_DEBOUNCE_TIMER, PUB_SUB_EVENTS } from '@/scripts/theme/constants'
import {
	debounce,
	fetchConfig,
	getAttributeOrThrow,
	qsaOptional,
	qsOptional,
	qsRequired,
	targetRequired,
} from '@/scripts/functions'
import { publish, PubSubEvent, subscribe } from '@/scripts/theme/pubsub'
import { routes, type uCoastWindow } from '@/scripts/setup'
import { type ShopifySectionRenderingSchema } from '@/scripts/types/theme'
import { trapFocus } from '@/scripts/global'
import { type CartDrawer } from '@/scripts/cart-drawer/cart-drawer'
import { UcoastEl } from '@/scripts/core/UcoastEl'

declare let window: uCoastWindow

export class CartItems extends UcoastEl {
	static htmlSelector = 'cart-items'
	static selectors = {
		itemLink: '.cart-item__name',
		cartPageLineItemStatus: '#shopping-cart-line-item-status',
		cartDrawerLineItemStatus: '#shopping-cart-line-item-status',
		cartPageErrors: '#cart-errors',
		cartDrawerErrors: '#CartDrawer-CartErrors',
		cartPageLiveRegionText: '#cart-live-region-text',
		cartDrawerLiveRegionText: '#CartDrawer-LiveRegionText',
		cartPageMain: '#main-cart-items',
		cartDrawerMain: '#CartDrawer-CartItems',
		cartDrawerEmpty: '.drawer__inner-empty',
		item: '.cart-item',
		itemErrorText: '.cart-item__error-text',
		footer: '#main-cart-footer',
		loadingOverlay: '.loading-overlay',
		// the following selectors are partial - they will be concatenated with the line ID
		cartPageLine: '#CartItem',
		cartDrawerLine: '#CartDrawer-Item',
		cartPageLineQuantity: '#Quantity',
		cartDrawerLineQuantity: '#Drawer-quantity',
		cartPageLineError: '#Line-item-error', // `${CartItems.selectors.cartPageLineError}-${line}`
		cartDrawerLineError: '#CartDrawer-LineItemError', // `${CartItems.selectors.cartDrawerLineError}-${line}`
	}
	static attributes = {
		disabled: 'data-uc-disabled',
	}
	lineItemStatusElement: HTMLElement
	cartUpdateUnsubscriber?: () => void = undefined
	constructor() {
		super()
		this.lineItemStatusElement =
			qsOptional(CartItems.selectors.cartPageLineItemStatus) ??
			qsRequired(CartItems.selectors.cartDrawerLineItemStatus)

		const debouncedOnChange = debounce((event: Event) => {
			this.onChange(event)
		}, ON_CHANGE_DEBOUNCE_TIMER)

		this.addEventListener('change', debouncedOnChange.bind(this))
	}

	override connectedCallback() {
		this.cartUpdateUnsubscriber = subscribe(
			PUB_SUB_EVENTS.cartUpdate,
			(pubSubEvent: PubSubEvent) => {
				if (pubSubEvent && 'source' in pubSubEvent && pubSubEvent.source === 'cart-items') {
					return
				}
				this.onCartUpdate()
			}
		)
	}

	override disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber()
		}
	}

	onChange(event: Event) {
		const target = targetRequired<Event, HTMLInputElement>(event)
		const targetIndex = getAttributeOrThrow('data-index', target)
		const activeElement = document.activeElement as HTMLElement
		if (!activeElement) throw new Error('no document.activeElement')
		const activeElementName = getAttributeOrThrow('name', activeElement)
		this.updateQuantity(targetIndex, target.value, activeElementName)
	}

	onCartUpdate() {
		fetch(`${routes.cart_url}?section_id=main-cart-items`)
			.then((response) => response.text())
			.then((responseText) => {
				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const source = qsRequired(CartItems.htmlSelector, html.documentElement)
				this.innerHTML = source.innerHTML
			})
			.catch((e) => {
				console.error(e)
			})
	}

	getSectionsToRender(): ShopifySectionRenderingSchema[] {
		return [
			{
				id: 'main-cart-items',
				section: getAttributeOrThrow(
					'data-id',
					qsRequired(CartItems.selectors.cartPageMain)
				),
				selector: '.js-contents',
			},
			{
				id: 'cart-icon-bubble',
				section: 'cart-icon-bubble',
				selector: '.shopify-section',
			},
			{
				id: 'cart-live-region-text',
				section: 'cart-live-region-text',
				selector: '.shopify-section',
			},
			{
				id: 'main-cart-footer',
				section: getAttributeOrThrow('data-id', qsRequired(CartItems.selectors.footer)),
				selector: '.js-contents',
			},
		]
	}

	updateQuantity(line: string, quantity: string, name?: string) {
		this.enableLoading(line)

		const body = JSON.stringify({
			line,
			quantity,
			sections: this.getSectionsToRender().map((section) => section.section),
			sections_url: window.location.pathname,
		})

		fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
			.then((response) => {
				return response.text()
			})
			.then((state) => {
				const parsedState = JSON.parse(state)
				const quantityElement =
					qsOptional<HTMLInputElement>(
						`${CartItems.selectors.cartPageLineQuantity}-${line}`
					) ||
					qsRequired<HTMLInputElement>(
						`${CartItems.selectors.cartDrawerLineQuantity}-${line}`
					)
				const items = document.querySelectorAll(CartItems.selectors.item)

				if (parsedState.errors) {
					quantityElement.value = getAttributeOrThrow('value', quantityElement)
					this.updateLiveRegions(line, parsedState.errors)
					return
				}

				const cartDrawerWrapper = qsOptional<CartDrawer>('cart-drawer')
				const cartFooter = qsOptional(CartItems.selectors.footer)

				if (parsedState.item_count === 0) {
					this.removeAttribute(ATTRIBUTES.cartEmpty)
					cartFooter && cartFooter.removeAttribute(ATTRIBUTES.cartEmpty)
					cartDrawerWrapper && cartDrawerWrapper.removeAttribute(ATTRIBUTES.cartEmpty)
				} else {
					this.setAttribute(ATTRIBUTES.cartEmpty, '')
					cartFooter && cartFooter.setAttribute(ATTRIBUTES.cartEmpty, '')
					cartDrawerWrapper && cartDrawerWrapper.setAttribute(ATTRIBUTES.cartEmpty, '')
				}

				this.getSectionsToRender().forEach((section: ShopifySectionRenderingSchema) => {
					const sectionEl = qsRequired(`#${section.id}`)
					const elementToReplace =
						(section.selector && sectionEl.querySelector(section.selector)) || sectionEl
					if (!section.section) throw new Error('no section.section')
					if (!section.selector) throw new Error('no section.selector')
					elementToReplace.innerHTML = this.getSectionInnerHTML(
						parsedState.sections[section.section],
						section.selector
					)
				})
				const updatedValue = parsedState.items[parseInt(line) - 1]
					? parsedState.items[parseInt(line) - 1].quantity
					: undefined
				let message = ''
				if (
					items.length === parsedState.items.length &&
					updatedValue !== parseInt(quantityElement.value)
				) {
					if (typeof updatedValue === 'undefined') {
						message = window.cartStrings.error
					} else {
						message = window.cartStrings.quantityError.replace(
							'[quantity]',
							updatedValue
						)
					}
				}
				this.updateLiveRegions(line, message)

				const lineItem =
					qsOptional(`${CartItems.selectors.cartPageLine}-${line}`) ||
					qsOptional(`${CartItems.selectors.cartDrawerLine}-${line}`)
				if (lineItem?.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(cartDrawerWrapper, qsRequired(`[name="${name}"]`, lineItem))
						: qsRequired(`[name="${name}"]`, lineItem).focus()
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						qsRequired(CartItems.selectors.cartDrawerEmpty, cartDrawerWrapper),
						qsRequired('a', cartDrawerWrapper)
					)
				} else if (document.querySelector(CartItems.selectors.item) && cartDrawerWrapper) {
					trapFocus(cartDrawerWrapper, qsRequired(CartItems.selectors.itemLink))
				}
				publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' })
			})
			.catch(() => {
				this.querySelectorAll(CartItems.selectors.loadingOverlay).forEach((overlay) =>
					overlay.classList.add('hidden')
				)
				const errors =
					qsOptional(CartItems.selectors.cartPageErrors) ??
					qsRequired(CartItems.selectors.cartDrawerErrors)
				errors.textContent = window.cartStrings.error
			})
			.finally(() => {
				this.disableLoading(line)
			})
	}

	updateLiveRegions(line: string, message: string) {
		const lineItemError =
			qsOptional(`${CartItems.selectors.cartPageLineError}-${line}`) ??
			qsOptional(`${CartItems.selectors.cartDrawerLineError}-${line}`)
		if (lineItemError) {
			const errorText = qsRequired(CartItems.selectors.itemErrorText, lineItemError)
			errorText.innerHTML = message
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', 'true')

		const cartStatus =
			qsOptional(CartItems.selectors.cartPageLiveRegionText) ??
			qsRequired(CartItems.selectors.cartDrawerLiveRegionText)
		cartStatus.setAttribute('aria-hidden', 'false')

		setTimeout(() => {
			cartStatus.setAttribute('aria-hidden', 'true')
		}, 1000)
	}

	getSectionInnerHTML(html: string, selector: string) {
		const newDocument = new DOMParser().parseFromString(html, 'text/html')
		const newElement = qsRequired(selector, newDocument.documentElement)
		return newElement.innerHTML
	}

	enableLoading(line: string) {
		const mainCartItems = this.getMainCartItems()
		mainCartItems.setAttribute(CartItems.attributes.disabled, '')

		this.getCartItemElements(line)?.forEach((overlay) => overlay.classList.remove('hidden'))
		this.getCartDrawerItemElements(line)?.forEach((overlay) =>
			overlay.classList.remove('hidden')
		)

		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur()
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', 'false')
	}

	getMainCartItems() {
		return (
			qsOptional(CartItems.selectors.cartPageMain) ??
			qsRequired(CartItems.selectors.cartDrawerMain)
		)
	}

	getCartItemElements(line: string) {
		return qsaOptional(`${CartItems.selectors.cartPageLine}-${line} ${CartItems.selectors.loadingOverlay}`, this)
	}

	getCartDrawerItemElements(line: string) {
		return qsaOptional(`${CartItems.selectors.cartDrawerLine}-${line} ${CartItems.selectors.loadingOverlay}`, this)
	}

	disableLoading(line: string) {
		this.getMainCartItems().removeAttribute(CartItems.attributes.disabled)
		this.getCartItemElements(line)?.forEach((overlay) => overlay.classList.add('hidden'))
		this.getCartDrawerItemElements(line)?.forEach((overlay) => overlay.classList.add('hidden'))
	}
}
