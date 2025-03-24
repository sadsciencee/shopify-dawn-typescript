import { TsDOM as q} from '@/scripts/core/TsDOM'
import { CartDrawer } from '@/scripts/cart/cart-drawer'
import { CartNote } from '@/scripts/cart/cart-note'
import { CartDrawerItems } from '@/scripts/cart/cart-drawer-items'
import { CartRemoveButton } from '@/scripts/cart/cart-remove-button'
import { CartItems } from '@/scripts/cart/cart-items';
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
import { DynamicProgressBar } from '@/scripts/cart/dynamic-progress-bar'

q.safeDefineElement(QuantityInput)
q.safeDefineElement(CartNotification)
q.safeDefineElement(CartDrawer)
q.safeDefineElement(CartNote)
q.safeDefineElement(CartItems)
q.safeDefineElement(CartDrawerItems)
q.safeDefineElement(CartRemoveButton)
q.safeDefineElement(SearchForm)
q.safeDefineElement(PredictiveSearch)
q.safeDefineElement(HeaderMenu)
q.safeDefineElement(DetailsModal)
q.safeDefineElement(MenuDrawer)
q.safeDefineElement(HeaderDrawer)
q.safeDefineElement(ModalDialog)
q.safeDefineElement(ModalOpener)
q.safeDefineElement(DynamicProgressBar)
