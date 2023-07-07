import { safeDefineElement } from '@/scripts/functions';
import { CartDrawer } from '@/scripts/cart-drawer/cart-drawer'
import { CartNote } from '@/scripts/cart-page/cart-note'
import { CartDrawerItems } from '@/scripts/cart-drawer/cart-drawer-items'
import { CartRemoveButton } from '@/scripts/cart-page/cart-remove-button'
import { CartItems } from '@/scripts/cart-page/cart-items';
import { PredictiveSearch } from '@/scripts/optional/predictive-search';
import { QuantityInput } from '@/scripts/theme/quantity-input';
import { SearchForm } from '@/scripts/theme/search-form';
import { CartNotification } from '@/scripts/theme/cart-notification';
import { HeaderMenu } from '@/scripts/theme/header-menu';
import { DetailsModal } from '@/scripts/theme/details-modal';
import { MenuDrawer } from '@/scripts/theme/menu-drawer';
import { HeaderDrawer } from '@/scripts/theme/header-drawer';
import { ModalDialog } from '@/scripts/theme/modal-dialog';
import { ModalOpener } from '@/scripts/theme/modal-opener';

safeDefineElement(QuantityInput)
safeDefineElement(CartNotification)
safeDefineElement(CartDrawer)
safeDefineElement(CartNote)
safeDefineElement(CartItems)
safeDefineElement(CartDrawerItems)
safeDefineElement(CartRemoveButton)
safeDefineElement(SearchForm)
safeDefineElement(PredictiveSearch)
safeDefineElement(HeaderMenu)
safeDefineElement(DetailsModal)
safeDefineElement(MenuDrawer)
safeDefineElement(HeaderDrawer)
safeDefineElement(ModalDialog)
safeDefineElement(ModalOpener)
