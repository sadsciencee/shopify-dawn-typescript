import { ATTRIBUTES, ON_CHANGE_DEBOUNCE_TIMER, PUB_SUB_EVENTS, SELECTORS } from '@/scripts/theme/constants';
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
	// static
	static htmlSelector = 'cart-items'
	static selectors = {
		element: 'cart-items',
		itemLink: '[data-uc-cart-item-name]',
		lineItemStatus: '[data-uc-cart-page-status]',
		errors: '[data-uc-cart-page-errors]',
		liveRegionText: '#CartPage-LiveRegionText',
		main: '#main-cart-items',
		cartDrawerInner: '[data-uc-cart-drawer-inner]',
		cartDrawerInnerEmpty: '[data-uc-cart-drawer-inner-empty]',
		item: '[data-uc-cart-item]',
		itemErrorText: '[data-uc-cart-item-error-text]',
		footer: '#CartPage-Footer',
		loadingOverlay: '[data-uc-loading-overlay]',
		// the following selectors are partial - they will be concatenated with the line ID
		line: '#CartPage-Item', // ex: `${this.instanceSelectors.line}-${line}`
		lineQuantity: '#CartPage-LineItemQuantity', // ex: `${this.instanceSelectors.lineQuantity}-${line}`
		lineError: '#CartPage-LineItemError', // ex: `${this.instanceSelectors.lineError}-${line}`
	}
	// TODO: refactor to global attributes selector
	static attributes = {
		disabled: 'data-uc-disabled',
	}

	// instance specific property types
	instanceSelectors = CartItems.selectors
	lineItemStatusElement: HTMLElement
	cartUpdateUnsubscriber?: () => void = undefined

	// init
	constructor() {
		super()
		this.setInstanceSelectors()
		this.lineItemStatusElement = qsRequired(this.instanceSelectors.lineItemStatus)

		const debouncedOnChange = debounce((event: Event) => {
			this.onChange(event)
		}, ON_CHANGE_DEBOUNCE_TIMER)

		this.addEventListener('change', debouncedOnChange.bind(this))
	}

	// have to instantiate selectors here so they can be different for CartDrawerItems
	setInstanceSelectors() {
		this.instanceSelectors = CartItems.selectors
	}

	// from here on is default Dawn CartItems -> typescript
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
				// reference CartItems selectors here since this returns then inner HTML I guess
				const source = qsRequired(CartItems.selectors.element, html.documentElement)
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
				section: getAttributeOrThrow('data-id', qsRequired(this.instanceSelectors.main)),
				selector: '.js-contents',
			},
			{
				id: 'CartIconBubble',
				section: 'cart-icon-bubble',
				selector: SELECTORS.cartLink,
			},
			{
				id: 'CartPage-LiveRegionText',
				section: 'cart-live-region-text',
				selector: '.shopify-section',
			},
			{
				id: 'CartPage-Footer',
				section: getAttributeOrThrow('data-id', qsRequired(this.instanceSelectors.footer)),
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
				const quantityElement = qsRequired<HTMLInputElement>(
					`${this.instanceSelectors.lineQuantity}-${line}`
				)
				const items = document.querySelectorAll(this.instanceSelectors.item)

				if (parsedState.errors) {
					quantityElement.value = getAttributeOrThrow('value', quantityElement)
					this.updateLiveRegions(line, parsedState.errors)
					return
				}

				const cartDrawerWrapper = qsOptional<CartDrawer>('cart-drawer')
				const cartFooter = qsOptional(this.instanceSelectors.footer)
				if (parsedState.item_count === 0) {
					this.setAttribute(ATTRIBUTES.cartEmpty, '')
					cartFooter && cartFooter.setAttribute(ATTRIBUTES.cartEmpty, '')
					cartDrawerWrapper && cartDrawerWrapper.setAttribute(ATTRIBUTES.cartEmpty, '')
				} else {
					this.removeAttribute(ATTRIBUTES.cartEmpty)
					cartFooter && cartFooter.removeAttribute(ATTRIBUTES.cartEmpty)
					cartDrawerWrapper && cartDrawerWrapper.removeAttribute(ATTRIBUTES.cartEmpty)
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

				const lineItem = qsOptional(`${this.instanceSelectors.line}-${line}`)
				if (lineItem?.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(cartDrawerWrapper, qsRequired(`[name="${name}"]`, lineItem))
						: qsRequired(`[name="${name}"]`, lineItem).focus()
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						qsRequired(this.instanceSelectors.cartDrawerInnerEmpty, cartDrawerWrapper),
						qsRequired('a', cartDrawerWrapper)
					)
				} else if (document.querySelector(this.instanceSelectors.item) && cartDrawerWrapper) {
					trapFocus(cartDrawerWrapper, qsRequired(this.instanceSelectors.itemLink))
				}
				publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' })
			})
			.catch((error) => {
				console.error(error)
				this.querySelectorAll(this.instanceSelectors.loadingOverlay).forEach((overlay) =>
					overlay.classList.add('hidden')
				)
				const errors = qsRequired(this.instanceSelectors.errors)
				errors.textContent = window.cartStrings.error
			})
			.finally(() => {
				this.disableLoading(line)
			})
	}

	updateLiveRegions(line: string, message: string) {
		const lineItemError = qsOptional(`${this.instanceSelectors.lineError}-${line}`)
		if (lineItemError) {
			const errorText = qsRequired(this.instanceSelectors.itemErrorText, lineItemError)
			errorText.innerHTML = message
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', 'true')

		const cartStatus = qsRequired(this.instanceSelectors.liveRegionText)
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

		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur()
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', 'false')
	}

	getMainCartItems() {
		return qsRequired(this.instanceSelectors.main)
	}

	getCartItemElements(line: string) {
		return qsaOptional(
			`${this.instanceSelectors.line}-${line} ${this.instanceSelectors.loadingOverlay}`,
			this
		)
	}

	disableLoading(line: string) {
		this.getMainCartItems().removeAttribute(CartItems.attributes.disabled)
		this.getCartItemElements(line)?.forEach((overlay) => overlay.classList.add('hidden'))
	}
}
