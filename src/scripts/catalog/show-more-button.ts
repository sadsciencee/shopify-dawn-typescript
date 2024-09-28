import { TsDOM as q } from '@/scripts/core/TsDOM'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class ShowMoreButton extends UcoastEl {
	static htmlSelector = 'show-more-button'
	static selectors = {
		button: '[data-uc-show-more]',
		item: '[data-uc-show-more-item]',
		display: '[data-uc-show-more-display]',
		wrap: '[data-uc-show-more-wrap]',
		label: '[data-uc-show-more-label]'
	}
	index: string
	constructor() {
		super()
		const button = q.rs(ShowMoreButton.selectors.button, this)
		this.index = getAttributeOrThrow('data-uc-show-more', button)
		button.addEventListener('click', (event) => {
			this.expandShowMore(event)

			const nextElementToFocus = q.os(
				`[data-uc-show-more-item${this.index}]:not('.hidden)'`
			)
			if (!nextElementToFocus) return
			const input = q.os('input', nextElementToFocus)
			if (!input) return
			input.focus()
		})
	}
	expandShowMore(_event: Event) {
		this.querySelectorAll(ShowMoreButton.selectors.label).forEach((element) =>
			element.classList.toggle('hidden')
		)
		const items = q.ol(`[data-uc-show-more-item="${this.index}"]`)
		items?.forEach((item) => item.classList.toggle('hidden'))
	}
}
