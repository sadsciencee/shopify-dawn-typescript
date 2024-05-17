import { ON_CHANGE_DEBOUNCE_TIMER } from '@/scripts/core/global'
import { debounce, fetchConfig, qsRequired, targetRequired } from '@/scripts/core/global';
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class CartNote extends UcoastEl {
	static htmlSelector = 'cart-note'
	input: HTMLTextAreaElement
	constructor() {
		super()
		this.input = qsRequired('textarea', this)

		this.input.addEventListener(
			'change',
			debounce((event: Event) => {
				const target = targetRequired<Event, HTMLTextAreaElement>(event)
				const body = JSON.stringify({ note: target.value })
				void fetch(`${window.routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
			}, ON_CHANGE_DEBOUNCE_TIMER)
		)
	}
}
