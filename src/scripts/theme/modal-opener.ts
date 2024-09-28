import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type ModalDialog } from '@/scripts/theme/modal-dialog';
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class ModalOpener extends UcoastEl {
  static htmlSelector = 'modal-opener';
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const modalSelector = this.getAttribute('data-modal')
      if (!modalSelector) return;
      const modal = qsOptional<ModalDialog>(modalSelector);
      console.log('modalSelector', modalSelector)
      console.log({modal})
      if (modal) modal.show(button);
    });
  }
}
