import {
  closestOptional,
  qsRequired, targetClosestOptional,
  targetRequired
} from '@/scripts/functions';
import { StickyHeader } from '@/scripts/theme/sticky-header';
import { removeTrapFocus, trapFocus } from '@/scripts/theme/global';
import { ShopifySectionRenderingSchema } from '@/scripts/types/theme';

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

  renderContents(parsedState) {
    this.cartItemKey = parsedState.key;
    this.getSectionsToRender().forEach((section) => {
      document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
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
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
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
