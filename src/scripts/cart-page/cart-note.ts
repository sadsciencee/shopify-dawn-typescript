import { ON_CHANGE_DEBOUNCE_TIMER } from '@/scripts/theme/constants'
import { routes } from '@/scripts/setup'
import { debounce, fetchConfig, targetRequired } from '@/scripts/functions';
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class CartNote extends UcoastEl {
	static htmlSelector = 'cart-note'
	constructor() {
		super()

		this.addEventListener(
			'change',
			debounce((event: Event) => {
				const target = targetRequired<Event, HTMLTextAreaElement>(event)
				const body = JSON.stringify({ note: target.value })
				void fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
			}, ON_CHANGE_DEBOUNCE_TIMER)
		)
	}
}
