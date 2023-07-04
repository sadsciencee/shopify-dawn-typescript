import { CartDrawer } from '@/scripts/cart/cart-drawer'
import { CartNotification } from '@/scripts/cart/cart-notification'
import { CartItems } from '@/scripts/cart/cart-items'
import { CartNote } from '@/scripts/cart/cart-note'
import { CartDrawerItems } from '@/scripts/cart/cart-drawer-items'
import { CartRemoveButton } from '@/scripts/cart/cart-remove-button'
import { safeDefineElement } from '@/scripts/functions';
safeDefineElement(CartDrawer)
safeDefineElement(CartNotification)
safeDefineElement(CartItems)
safeDefineElement(CartNote)
safeDefineElement(CartDrawerItems)
safeDefineElement(CartRemoveButton)

