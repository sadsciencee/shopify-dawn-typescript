import { ON_CHANGE_DEBOUNCE_TIMER, PUB_SUB_EVENTS } from '@/scripts/theme/constants'
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
import { UcoastEl } from '@/scripts/core/UcoastEl';

declare let window: uCoastWindow

export class CartItems extends UcoastEl {
	static htmlSelector = 'cart-items'
	lineItemStatusElement: HTMLElement
	cartUpdateUnsubscriber?: () => void = undefined
	constructor() {
		super()
		this.lineItemStatusElement =
			qsOptional('#shopping-cart-line-item-status') ??
			qsRequired('#CartDrawer-LineItemStatus')

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
				const sourceQty = qsRequired('cart-items', html.documentElement)
				this.innerHTML = sourceQty.innerHTML
			})
			.catch((e) => {
				console.error(e)
			})
	}

	getSectionsToRender(): ShopifySectionRenderingSchema[] {
		return [
			{
				id: 'main-cart-items',
				section: getAttributeOrThrow('data-id', qsRequired('#main-cart-items')),
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
				section: getAttributeOrThrow('data-id', qsRequired('#main-cart-footer')),
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
					qsOptional<HTMLInputElement>(`#Quantity-${line}`) ||
					qsRequired<HTMLInputElement>(`#Drawer-quantity-${line}`)
				const items = document.querySelectorAll('.cart-item')

				if (parsedState.errors) {
					quantityElement.value = getAttributeOrThrow('value', quantityElement)
					this.updateLiveRegions(line, parsedState.errors)
					return
				}

				this.classList.toggle('is-empty', parsedState.item_count === 0)
				const cartDrawerWrapper = qsOptional<CartDrawer>('cart-drawer')
				const cartFooter = qsOptional('#main-cart-footer')

				if (cartFooter)
					cartFooter.classList.toggle('is-empty', parsedState.item_count === 0)
				if (cartDrawerWrapper)
					cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0)

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
					qsOptional(`#CartItem-${line}`) || qsOptional(`#CartDrawer-Item-${line}`)
				if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(cartDrawerWrapper, qsRequired(`[name="${name}"]`, lineItem))
						: qsRequired(`[name="${name}"]`, lineItem).focus()
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						qsRequired('.drawer__inner-empty', cartDrawerWrapper),
						qsRequired('a', cartDrawerWrapper)
					)
				} else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
					trapFocus(cartDrawerWrapper, qsRequired('.cart-item__name'))
				}
				publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' })
			})
			.catch(() => {
				this.querySelectorAll('.loading-overlay').forEach((overlay) =>
					overlay.classList.add('hidden')
				)
				const errors = qsOptional('#cart-errors') ?? qsRequired('#CartDrawer-CartErrors')
				errors.textContent = window.cartStrings.error
			})
			.finally(() => {
				this.disableLoading(line)
			})
	}

	updateLiveRegions(line: string, message: string) {
		const lineItemError =
			qsOptional(`#Line-item-error-${line}`) ??
			qsOptional(`#CartDrawer-LineItemError-${line}`)
		if (lineItemError) {
			const errorText = qsRequired('.cart-item__error-text', lineItemError)
			errorText.innerHTML = message
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', 'true')

		const cartStatus =
			qsOptional('#cart-live-region-text') ?? qsRequired('#CartDrawer-LiveRegionText')
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
		mainCartItems.classList.add('cart__items--disabled')

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
		return qsOptional('#main-cart-items') ?? qsRequired('#CartDrawer-CartItems')
	}

	getCartItemElements(line: string) {
		return qsaOptional(`#CartItem-${line} .loading-overlay`, this)
	}

	getCartDrawerItemElements(line: string) {
		return qsaOptional(`#CartDrawer-Item-${line} .loading-overlay`, this)
	}

	disableLoading(line: string) {
		const mainCartItems = this.getMainCartItems()
		mainCartItems.classList.remove('cart__items--disabled')

		this.getCartItemElements(line)?.forEach((overlay) => overlay.classList.add('hidden'))
		this.getCartDrawerItemElements(line)?.forEach((overlay) => overlay.classList.add('hidden'))
	}
}
