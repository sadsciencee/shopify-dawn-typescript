import { qsRequired } from '@/scripts/functions'

export class DetailsDisclosure extends HTMLElement {
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
	}
}
