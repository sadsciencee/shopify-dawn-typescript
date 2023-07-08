import { CartItems } from '@/scripts/cart-page/cart-items'

export class CartDrawerItems extends CartItems {
	static override htmlSelector = 'cart-drawer-items'
	static override selectors = {
		...CartItems.selectors,
		element: 'cart-drawer-items',
		itemLink: '.cart-item__name',
		lineItemStatus: '#CartDrawer-LineItemStatus',
		errors: '#CartDrawer-CartErrors',
		liveRegionText: '#CartDrawer-LiveRegionText',
		main: '#CartDrawer-CartItems',
		// the following selectors are partial - they will be concatenated with the line ID
		line: '#CartDrawer-Item',
		lineQuantity: '#Drawer-quantity',
		lineError: '#CartDrawer-LineItemError', // `${CartItems.selectors.cartDrawerLineError}-${line}`
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
				section: 'cart-drawer',
				selector: this.instanceSelectors.cartDrawerInner,
			},
			{
				id: 'cart-icon-bubble',
				section: 'cart-icon-bubble',
				selector: '.shopify-section',
			},
		]
	}
}
