import { pauseAllMedia, qsOptional, qsRequired, targetClosestOptional } from '@/scripts/core/global'
import { type DeferredMedia } from '@/scripts/theme/deferred-media'
import { removeTrapFocus, trapFocus } from '@/scripts/core/global'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class ModalDialog extends UcoastEl {
	static htmlSelector = 'modal-dialog'
	moved: boolean = false
	openedBy?: HTMLElement
	constructor() {
		super()
		this.querySelector('[id^="ModalClose-"]')?.addEventListener(
			'click',
			this.hide.bind(this, false)
		)
		this.addEventListener('keyup', (event) => {
			if (event.code.toUpperCase() === 'ESCAPE') this.hide()
		})
		if (this.classList.contains('media-modal')) {
			this.addEventListener('pointerup', (event) => {
				if (
					event.pointerType === 'mouse' &&
					!targetClosestOptional(event, 'deferred-media, product-model')
				)
					this.hide()
			})
		} else {
			this.addEventListener('click', (event) => {
				if (event.target === this) this.hide()
			})
		}
	}

	override connectedCallback() {
		if (this.moved) return
		this.moved = true
		if (this.isInline()) {
		}
		document.body.appendChild(this)
	}

	getHtmlSelector() {
		return ModalDialog.htmlSelector
	}

	isInline(): boolean {
		if (
			this.hasAttribute('data-no-desktop-move') &&
			window.matchMedia('(min-width: 750px)').matches
		) {
			return true
		}
		if (this.getHtmlSelector() === 'welcome-popup') {
			return true
		}

		return false
	}

	show(opener: HTMLElement) {
		this.openedBy = opener
		const popup = qsOptional<DeferredMedia>('.template-popup', this)
		if (!this.isInline()) {
			document.body.classList.add('overflow-hidden')
		}
		this.setAttribute('open', '')
		if (popup) popup.loadContent()
		trapFocus(this, qsRequired('[role="dialog"]', this))
		if (!this.isInline()) {
			pauseAllMedia()
		}
	}

	hide(preventFocus = false) {
		if (preventFocus) this.openedBy = undefined
		if (!this.isInline()) {
			document.body.classList.remove('overflow-hidden')
		}
		document.body.dispatchEvent(new CustomEvent('modalClosed'))
		this.removeAttribute('open')

		removeTrapFocus(this.openedBy)
		if (!this.isInline()) {
			pauseAllMedia()
		}
	}
}
