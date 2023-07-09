import { ModalDialog } from '@/scripts/theme/modal-dialog'
import { qsOptional, qsRequired } from '@/scripts/functions'
import { DeferredMedia } from '@/scripts/theme/deferred-media'

export class ProductModal extends ModalDialog {
	static override htmlSelector = 'product-modal'
	constructor() {
		super()
	}
	static selectors = {
		container: '[data-uc-product-modal-container]',
	}

	override hide() {
		super.hide()
	}

	override show(opener: HTMLElement) {
		super.show(opener)
		this.showActiveMedia()
	}

	showActiveMedia() {
		const openedById = this.openedBy ? this.openedBy.getAttribute('data-media-id') : 'NO_OPENER'
		this.querySelectorAll(`[data-media-id]:not([data-media-id="${openedById}"])`).forEach(
			(element) => {
				element.classList.remove('active')
			}
		)
		const activeMedia = qsOptional<
			HTMLImageElement | HTMLVideoElement | HTMLIFrameElement | DeferredMedia
		>(`[data-media-id="${openedById}"]`, this)
		if (!activeMedia) {
			console.error('no active media found')
			return
		}
		const activeMediaTemplate = activeMedia.querySelector('template')
		const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null
		activeMedia.classList.add('active')
		activeMedia.scrollIntoView()

		const container = qsRequired(ProductModal.selectors.container, this)
		const activeMediaWidth = activeMedia.width
			? parseInt(`${activeMedia.width}`)
			: activeMedia.clientWidth
		container.scrollLeft = (activeMediaWidth - container.clientWidth) / 2

		if (
			activeMedia instanceof DeferredMedia &&
			activeMediaContent &&
			activeMediaContent.querySelector('.js-youtube')
		)
			activeMedia.loadContent()
	}
}
