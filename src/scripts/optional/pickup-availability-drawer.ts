import { qsRequired, targetRequired } from '@/scripts/functions';
import { removeTrapFocus, trapFocus } from '@/scripts/theme/global';

export class PickupAvailabilityDrawer extends HTMLElement {
  onBodyClick: (event: MouseEvent) => void;
  opener:HTMLButtonElement
  focusElement?:HTMLElement
  constructor() {
    super();

    this.onBodyClick = this.handleBodyClick.bind(this);
    this.opener = qsRequired('button', this);

    this.opener.addEventListener('click', () => {
      this.hide();
    });

    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
  }

  handleBodyClick(event:MouseEvent) {
    const target = targetRequired(event)
    if (
      target != this &&
      !target.closest('pickup-availability-drawer') &&
      target.id != 'ShowPickupAvailabilityDrawer'
    ) {
      this.hide();
    }
  }

  hide() {
    this.removeAttribute('open');
    document.body.removeEventListener('click', this.onBodyClick);
    document.body.classList.remove('overflow-hidden');
    removeTrapFocus(this.focusElement);
  }

  show(focusElement:HTMLElement) {
    this.focusElement = focusElement;
    this.setAttribute('open', '');
    document.body.addEventListener('click', this.onBodyClick);
    document.body.classList.add('overflow-hidden');
    trapFocus(this);
  }
}
