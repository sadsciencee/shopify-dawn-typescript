import { qsOptional, qsRequired, targetClosestOptional } from '@/scripts/functions';
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class ShowMoreButton extends UcoastEl {
  static htmlSelector = 'show-more-button';
  constructor() {
    super();
    const button = qsRequired('button', this);
    button.addEventListener('click', (event) => {
      this.expandShowMore(event);
      const targetClosest = targetClosestOptional(event,'.parent-display')
      if (!targetClosest) return;
      const nextElementToFocus = qsOptional('.show-more-item:not(.hidden)', targetClosest)
      if (!nextElementToFocus) return;
      //const nextElementToFocus = event.target.closest('.parent-display').querySelector('.show-more-item');
      const input = qsOptional('input', nextElementToFocus)
      if (!input) return;
      input.focus();
    });
  }
  expandShowMore(event: Event) {
    const targetClosest = targetClosestOptional(event,'[id^="Show-More-"]')
    if (!targetClosest) return;
    const parentDisplay = targetClosest.closest('.parent-display');
    if (!parentDisplay) return;
    const parentWrap = parentDisplay.querySelector('.parent-wrap');
    if (!parentWrap) return;
    this.querySelectorAll('.label-text').forEach((element) => element.classList.toggle('hidden'));
    parentDisplay.querySelectorAll('.show-more-item').forEach((item) => item.classList.toggle('hidden'));
  }
}
