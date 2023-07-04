import { closestOptional, closestRequired, getAttributeOrThrow } from '@/scripts/functions';
import { type CartItems } from '@/scripts/cart/cart-items';
import { type CartDrawerItems } from '@/scripts/cart/cart-drawer-items';

export class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = closestOptional<CartItems>(this, 'cart-items') || closestRequired<CartDrawerItems>(this, 'cart-drawer-items');
      cartItems.updateQuantity(getAttributeOrThrow('data-index', this), '0');
    });
  }
}
