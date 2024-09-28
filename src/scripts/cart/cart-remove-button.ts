import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type CartItems } from '@/scripts/cart/cart-items'
import { type CartDrawerItems } from '@/scripts/cart/cart-drawer-items'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class CartRemoveButton extends UcoastEl {
	static htmlSelector = 'cart-remove-button'
	constructor() {
		super()

		this.addEventListener('click', (event) => {
			event.preventDefault()
			const cartItems =
				q.oc<CartItems>(this, 'cart-items') ||
				q.rc<CartDrawerItems>(this, 'cart-drawer-items')
			cartItems.updateQuantity(getAttributeOrThrow('data-index', this), '0')
		})
	}
}
