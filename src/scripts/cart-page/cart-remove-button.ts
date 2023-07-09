import { closestOptional, closestRequired, getAttributeOrThrow } from '@/scripts/functions'
import { type CartItems } from '@/scripts/cart-page/cart-items'
import { type CartDrawerItems } from '@/scripts/cart-drawer/cart-drawer-items'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class CartRemoveButton extends UcoastEl {
	static htmlSelector = 'cart-remove-button'
	constructor() {
		super()

		this.addEventListener('click', (event) => {
			event.preventDefault()
			const cartItems =
				closestOptional<CartItems>(this, 'cart-items') ||
				closestRequired<CartDrawerItems>(this, 'cart-drawer-items')
			cartItems.updateQuantity(getAttributeOrThrow('data-index', this), '0')
		})
	}
}
