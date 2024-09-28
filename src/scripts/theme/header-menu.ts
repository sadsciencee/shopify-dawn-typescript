import { DetailsDisclosure } from '@/scripts/theme/details-disclosure';
import { TsDOM as q } from '@/scripts/core/TsDOM'
import {
  scaleValue,
} from '@/scripts/core/global'
import {type StickyHeader } from '@/scripts/theme/sticky-header';
import { SELECTORS } from '@/scripts/core/global';

export class HeaderMenu extends DetailsDisclosure {
  static override htmlSelector = 'header-menu'
  header: StickyHeader | null
  hoverSummary?: HTMLElement
  detailsId?: string
  constructor() {
    super()
    this.header = q.rs<StickyHeader>(SELECTORS.headerWrapper)
    this.hoverSummary = q.os('summary[data-summary-hover="on"]', this)
    this.detailsId = q.oa(this.mainDetailsToggle, 'id')
    this.initHoverSummary()
  }

  initHoverSummary() {
    if (!this.hoverSummary || !this.detailsId) return

    this.hoverSummary.addEventListener('click', (_) => {
      void window.Ucoast.mediaManager.loadAllInContainer(this.mainDetailsToggle)
      window.setTimeout(() => {
        void window.Ucoast.mediaManager.loadAllInContainer(this.mainDetailsToggle)
      }, 3)
    })

    this.hoverSummary.addEventListener('mouseenter', (_) => {
      void window.Ucoast.mediaManager.loadAllInContainer(this.mainDetailsToggle)
      const openMenuId = window.Ucoast.openMenuId
      if (openMenuId && openMenuId === this.detailsId) return
      window.Ucoast.openMenuId = this.detailsId
      this.mainDetailsToggle.setAttribute('open', '')
      this.animations?.forEach((animation) => animation.play())
      this.hoverSummary?.setAttribute('aria-expanded', 'true')
      void window.Ucoast.mediaManager.loadAllInContainer(this.mainDetailsToggle)
    })

    this.mainDetailsToggle.addEventListener('keyup', q.onKeyUpEscape)
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
