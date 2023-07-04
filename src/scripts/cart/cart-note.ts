import { ON_CHANGE_DEBOUNCE_TIMER } from '@/scripts/theme/constants'
import { routes } from '@/scripts/setup'
import { targetRequired } from '@/scripts/functions'
import { debounce, fetchConfig } from '@/scripts/theme/global';

export class CartNote extends HTMLElement {
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
