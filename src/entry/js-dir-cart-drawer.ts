import { safeDefineElement } from '@/scripts/functions';
import { CartDrawer } from '@/scripts/cart-drawer/cart-drawer'
import { CartNote } from '@/scripts/cart-page/cart-note'
import { CartDrawerItems } from '@/scripts/cart-drawer/cart-drawer-items'
import { CartRemoveButton } from '@/scripts/cart-page/cart-remove-button'
import { CartItems } from '@/scripts/cart-page/cart-items';

safeDefineElement(CartDrawer)
safeDefineElement(CartNote)
safeDefineElement(CartItems)
safeDefineElement(CartDrawerItems)
safeDefineElement(CartRemoveButton)


