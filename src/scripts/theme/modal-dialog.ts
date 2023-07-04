import { pauseAllMedia, qsOptional, qsRequired, targetClosestOptional } from '@/scripts/functions';
import { DeferredMedia } from '@/scripts/theme/deferred-media';
import { removeTrapFocus, trapFocus } from '@/scripts/theme/global';

export class ModalDialog extends HTMLElement {
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

	connectedCallback() {
		if (this.moved) return
		this.moved = true
		document.body.appendChild(this)
	}

	show(opener:HTMLElement) {
		this.openedBy = opener
		const popup = qsOptional<DeferredMedia>('.template-popup', this)
		document.body.classList.add('overflow-hidden')
		this.setAttribute('open', '')
		if (popup) popup.loadContent()
		trapFocus(this, qsRequired('[role="dialog"]', this))
		pauseAllMedia()
	}

	hide() {
		document.body.classList.remove('overflow-hidden')
		document.body.dispatchEvent(new CustomEvent('modalClosed'))
		this.removeAttribute('open')
		removeTrapFocus(this.openedBy)
		pauseAllMedia()
	}
}
