import { safeDefineElement } from '@/scripts/functions'
import { DeferredMedia } from '@/scripts/theme/deferred-media'
import { DetailsDisclosure } from '@/scripts/theme/details-disclosure'
import { DetailsModal } from '@/scripts/theme/details-modal'
import { HeaderDrawer } from '@/scripts/theme/header-drawer'
import { HeaderMenu } from '@/scripts/theme/header-menu'
import { MenuDrawer } from '@/scripts/theme/menu-drawer'
import { ModalDialog } from '@/scripts/theme/modal-dialog'
import { ModalOpener } from '@/scripts/theme/modal-opener'
import { QuantityInput } from '@/scripts/theme/quantity-input'
import { ShowMoreButton } from '@/scripts/theme/show-more-button'
import { SliderComponent } from '@/scripts/theme/slider-component'
import { SlideshowComponent } from '@/scripts/theme/slideshow-component'
import { StickyHeader } from '@/scripts/theme/sticky-header'
import { CartNotification } from '@/scripts/theme/cart-notification'
import { SearchForm } from '@/scripts/theme/search-form'

safeDefineElement(QuantityInput)
safeDefineElement(MenuDrawer)
safeDefineElement(HeaderDrawer)
safeDefineElement(ModalDialog)
safeDefineElement(ModalOpener)
safeDefineElement(DeferredMedia)
safeDefineElement(SliderComponent)
safeDefineElement(SlideshowComponent)

safeDefineElement(ShowMoreButton)
safeDefineElement(StickyHeader)
safeDefineElement(DetailsDisclosure)
safeDefineElement(HeaderMenu)
safeDefineElement(DetailsModal)
safeDefineElement(CartNotification)
safeDefineElement(SearchForm)
