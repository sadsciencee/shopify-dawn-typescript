import { DetailsDisclosure } from '@/scripts/theme/details-disclosure';
import { qsRequired, scaleValue } from '@/scripts/core/global';
import {type StickyHeader } from '@/scripts/theme/sticky-header';
import { SELECTORS } from '@/scripts/core/global';

export class HeaderMenu extends DetailsDisclosure {
  static override htmlSelector = 'header-menu'
  header: StickyHeader | null
  constructor() {
    super()
    this.header = qsRequired<StickyHeader>(SELECTORS.headerWrapper)
  }

  override onToggle() {
    if (!this.header) return
    this.header.preventHide = this.mainDetailsToggle.open

    if (
      document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !==
      ''
    )
      return
    const viewport = window.innerWidth >= 750 ? 'desktop' : 'mobile'
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `calc(${scaleValue(this.header.getBoundingClientRect().bottom, viewport)} * var(--ax))`
    )
  }
}
