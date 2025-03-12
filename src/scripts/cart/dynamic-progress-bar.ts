import { UcoastEl } from '@/scripts/core/UcoastEl'
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class DynamicProgressBar extends UcoastEl {
	static htmlSelector = 'dynamic-progress-bar'
	statusEl: HTMLElement
	constructor() {
		super()
		this.statusEl = this.getStatusEl(this)
	}
	getStatusEl(el: DynamicProgressBar) {
		return q.rs('[data-shipping-bar-status]', el)
	}
	animateFromRawHTML(rawHTML: string) {
		const newDocument = new DOMParser().parseFromString(
			rawHTML,
			'text/html'
		)
		const newShippingBar = q.rs<DynamicProgressBar>(
			DynamicProgressBar.htmlSelector,
			newDocument
		)
		const newPercent = parseInt(
			q.ra(newShippingBar, 'data-percent')
		)
		const newStatusEl = this.getStatusEl(newShippingBar)
		this.statusEl.innerHTML = newStatusEl.innerHTML
		this.style.setProperty('--progress-percent', `${newPercent}%`);
	}
}
