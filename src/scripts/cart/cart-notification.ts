import {
  closestOptional,
  qsRequired, targetClosestOptional,
  targetRequired
} from '@/scripts/functions';
import { type StickyHeader } from '@/scripts/theme/sticky-header';
import { removeTrapFocus, trapFocus } from '@/scripts/theme/global';
import { type ShopifySectionRenderingSchema } from '@/scripts/types/theme';
import { type SectionApiResponse } from '@/scripts/types/responses';

export class CartNotification extends HTMLElement {
  notification: HTMLElement;
  header: StickyHeader;
  onBodyClick: (event: MouseEvent) => void;
  activeElement?: HTMLElement;
  cartItemKey?: string;
  constructor() {

    super();

    this.notification = qsRequired('#cart-notification')
    this.header = qsRequired('sticky-header')
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener('keyup', (event) => event.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState: SectionApiResponse) {
    this.cartItemKey = parsedState.key;
    this.getSectionsToRender().forEach((section) => {
      const sectionId = section.id;
      if (!sectionId) throw new Error('section.id is not set');
      const sectionToUpdate = qsRequired(`#${sectionId}`);
      sectionToUpdate.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[sectionId],
        section.selector
      );
    });

    if (this.header) this.header.reveal();
    this.open();
  }

  getSectionsToRender(): ShopifySectionRenderingSchema[] {
    if (!this.cartItemKey) throw new Error('cartItemKey is not set');
    return [
      {
        id: 'cart-notification-product',
        selector: `[id="cart-notification-product-${this.cartItemKey}"]`,
      },
      {
        id: 'cart-notification-button',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionInnerHTML(html:string, selector = '.shopify-section') {
    const newDocument = new DOMParser().parseFromString(html, 'text/html')
    const newSection = qsRequired(selector, newDocument.documentElement)
    return newSection.innerHTML;
  }

  handleBodyClick(event: MouseEvent) {
    const target = targetRequired(event);
    const closestCartNotification = closestOptional<CartNotification>(target, 'cart-notification')
    if (target !== this.notification && !closestCartNotification) {
      const disclosure = targetClosestOptional(event,'details-disclosure, header-menu')
      this.activeElement = disclosure ? qsRequired('summary', disclosure) : undefined;
      this.close();
    }
  }

  setActiveElement(element: HTMLElement) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
