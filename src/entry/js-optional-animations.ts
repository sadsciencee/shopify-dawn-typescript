import { initializeScrollAnimationTrigger } from '@/scripts/theme/animations';
import { targetRequired } from '@/scripts/core/global';

window.addEventListener('DOMContentLoaded', () => initializeScrollAnimationTrigger())

document.addEventListener('shopify:section:load', (event: Event) => {
  initializeScrollAnimationTrigger(targetRequired<Event, Document>(event))
})
