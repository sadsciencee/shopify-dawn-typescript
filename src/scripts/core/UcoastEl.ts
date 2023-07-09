import { qsaOptional } from '@/scripts/functions'

export class UcoastEl extends HTMLElement {
	animateSelf: boolean
	animationObserver: IntersectionObserver | null
	animateableElements?: NodeListOf<HTMLElement>
	constructor() {
		super()
		this.animateSelf = this.hasAttribute('data-uc-animate')
		this.animateableElements = qsaOptional('[data-uc-animate]', this)
		this.animationObserver = null
	}
	connectedCallback() {
		if (this.animateSelf || this.animateableElements) {
			this.animateOut()
			this.observeVisibility()
		}
	}
	animateIn() {
		if (this.animateSelf) {
			this.setAttribute('data-uc-animate', 'in')
		} else if (this.animateableElements) {
			this.animateableElements.forEach((el) => {
				el.setAttribute('data-uc-animate', 'in')
			})
		}
	}
	animateOut() {
		if (this.animateSelf) {
			this.setAttribute('data-uc-animate', 'ready')
		} else if (this.animateableElements) {
			this.animateableElements.forEach((el) => {
				el.setAttribute('data-uc-animate', 'ready')
			})
		}
	}
	observeVisibility() {
		const animateArea = this.getAttribute('data-uc-animate-area')
		const threshold = animateArea ? parseFloat(animateArea) / 100 : 1.0

		const options = {
			root: null,
			rootMargin: '0px',
			threshold: threshold,
		}

		this.animationObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
					this.animateIn()
				} else {
					this.animateOut()
				}
			})
		}, options)

		if (this.animateSelf) {
			this.animationObserver.observe(this)
		} else if (this.animateableElements) {
			this.animateableElements.forEach((el) => this.animationObserver?.observe(el))
		}
	}
	disconnectedCallback() {
		if (this.animationObserver) {
			this.animationObserver.disconnect()
		}
	}
	validate(el: HTMLElement) {
		return el instanceof this.constructor
	}
	validated(el: HTMLElement, required: boolean) {
		const isValid = this.validate(el)
		if (isValid) return el
		if (required) throw new Error('Class Instance Not Valid')
		return undefined
	}
}
