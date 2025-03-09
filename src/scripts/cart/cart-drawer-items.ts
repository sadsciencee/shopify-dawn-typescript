import { CartItems } from '@/scripts/cart/cart-items'
import { SELECTORS } from '@/scripts/core/global';

export class CartDrawerItems extends CartItems {
	static override htmlSelector = 'cart-drawer-items'
	static override selectors = {
		...CartItems.selectors,
		element: 'cart-drawer-items',
		lineItemStatus: '[data-uc-cart-drawer-status]',
		errors: '[data-uc-cart-drawer-errors]',
		liveRegionText: '[data-uc-cart-drawer-live-region-text]',
		main: '[data-uc-cart-drawer-main]',
		// the following selectors are partial - they will be concatenated with the line ID
		line: '#CartDrawer-Item', // ex: `${this.instanceSelectors.line}-${line}`
		lineQuantity: '#CartDrawer-Quantity', // ex: `${this.instanceSelectors.lineQuantity}-${line}`
		lineError: '#CartDrawer-LineItemError', // ex: `${this.instanceSelectors.lineError}-${line}`
	}
	constructor() {
		super();

	}
	override setInstanceSelectors() {
		this.instanceSelectors = CartDrawerItems.selectors
	}
	override getSectionsToRender() {
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
				section: 'dynamic-shipping-bar',
				selector: 'dynamic-shipping-bar',
			},
			{
				id: 'CartDrawer',
				section: 'dynamic-cart-footer',
				selector: '.drawer__footer',
			},
		]
	}
}
