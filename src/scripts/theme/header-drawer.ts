import { MenuDrawer } from '@/scripts/theme/menu-drawer';
import { closestOptional, qsRequired } from '@/scripts/functions';
import { trapFocus } from '@/scripts/theme/global';

export class HeaderDrawer extends MenuDrawer {
  header?: HTMLElement
  borderOffset?: number
  constructor() {
    super();
  }

  setHeader() {
    return this.header || qsRequired('.section-header')
  }

  setBorderOffset() {
    return this.borderOffset || closestOptional(this,'.header-wrapper')?.classList.contains('header-wrapper--border-bottom') ? 1 : 0;
  }

  override openMenuDrawer(summaryElement:HTMLElement) {
    this.header = this.setHeader()
    this.borderOffset = this.setBorderOffset();
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${Math.round(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
    );
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', 'true');
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  override closeMenuDrawer(event:Event | undefined, elementToFocus: HTMLElement | undefined = undefined) {
    if (!elementToFocus) return;
    this.header = this.setHeader()
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    if (!this.header) return;
    this.borderOffset = this.setBorderOffset();
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${Math.round(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
    );
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
}
