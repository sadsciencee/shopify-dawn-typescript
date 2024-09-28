import { initializeScrollAnimationTrigger } from '@/scripts/theme/animations';
import { q.rt } from '@/scripts/core/global';

window.addEventListener('DOMContentLoaded', () => initializeScrollAnimationTrigger())

document.addEventListener('shopify:section:load', (event: Event) => {
  initializeScrollAnimationTrigger(q.rt<Event, Document>(event))
})
