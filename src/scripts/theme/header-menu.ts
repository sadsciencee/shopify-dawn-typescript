import { DetailsDisclosure } from '@/scripts/theme/details-disclosure';
import { qsRequired } from '@/scripts/functions';
import {type StickyHeader } from '@/scripts/theme/sticky-header';

export class HeaderMenu extends DetailsDisclosure {
  static override htmlSelector = 'header-menu'
  header: StickyHeader | null
  constructor() {
    super()
    this.header = qsRequired<StickyHeader>('.header-wrapper')
  }

  override onToggle() {
    if (!this.header) return
    this.header.preventHide = this.mainDetailsToggle.open

    if (
      document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !==
      ''
    )
      return
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    )
  }
}
