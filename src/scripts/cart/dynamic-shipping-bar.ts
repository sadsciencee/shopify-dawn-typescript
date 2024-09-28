import { UcoastEl } from '@/scripts/core/UcoastEl'
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class DynamicShippingBar extends UcoastEl {
	static htmlSelector = 'dynamic-shipping-bar'
	statusEl: HTMLElement
	constructor() {
		super()
		this.statusEl = this.getStatusEl(this)
	}
	getStatusEl(el: DynamicShippingBar) {
		return q.rs('[data-shipping-bar-status]', el)
	}
	animateFromRawHTML(rawHTML: string) {
		const newDocument = new DOMParser().parseFromString(
			rawHTML,
			'text/html'
		)
		const newShippingBar = q.rs<DynamicShippingBar>(
			DynamicShippingBar.htmlSelector,
			newDocument
		)
		const newPercent = parseInt(
			getAttributeOrThrow('data-percent', newShippingBar)
		)
		const newStatusEl = this.getStatusEl(newShippingBar)
		this.statusEl.innerHTML = newStatusEl.innerHTML
		this.style.setProperty('--progress-percent', `${newPercent}%`);
	}
}
