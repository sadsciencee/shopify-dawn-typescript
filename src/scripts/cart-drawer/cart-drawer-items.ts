import { CartItems } from '@/scripts/cart-page/cart-items'

export class CartDrawerItems extends CartItems {
	static override htmlSelector = 'cart-drawer-items'
	override getSectionsToRender() {
		return [
			{
				id: 'CartDrawer',
				section: 'cart-drawer',
				selector: '.drawer__inner',
			},
			{
				id: 'cart-icon-bubble',
				section: 'cart-icon-bubble',
				selector: '.shopify-section',
			},
		]
	}
}
