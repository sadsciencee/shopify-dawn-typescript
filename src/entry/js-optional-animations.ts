import { initializeScrollAnimationTrigger } from '@/scripts/theme/animations';
import { TsDOM as q } from '@/scripts/core/TsDOM';

window.addEventListener('DOMContentLoaded', () => initializeScrollAnimationTrigger())

document.addEventListener('shopify:section:load', (event: Event) => {
  initializeScrollAnimationTrigger(q.rt<Event, Document>(event))
})
