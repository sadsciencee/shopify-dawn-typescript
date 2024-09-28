import { UcoastEl } from '@/scripts/core/UcoastEl';
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class DetailsDisclosure extends UcoastEl {
	static htmlSelector = 'details-disclosure'
	mainDetailsToggle: HTMLDetailsElement
	content: HTMLElement
	animations?: Animation[]

	constructor() {
		super()
		this.mainDetailsToggle = qsRequired('details', this)
		this.content = qsRequired('summary', this.mainDetailsToggle, 'nextElementSibling')

		this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this))
		this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this))
	}



	onFocusOut() {
		setTimeout(() => {
			if (!this.contains(document.activeElement)) this.close()
		})
	}

	onToggle() {
		if (!this.animations) this.animations = this.content.getAnimations()

		if (this.mainDetailsToggle.hasAttribute('open')) {
			this.animations.forEach((animation) => animation.play())
		} else {
			this.animations.forEach((animation) => animation.cancel())
		}
	}

	close() {
		this.mainDetailsToggle.removeAttribute('open')
		qsRequired('summary', this.mainDetailsToggle).setAttribute('aria-expanded', 'false')
		window.Ucoast.openMenuId = undefined
	}
}
