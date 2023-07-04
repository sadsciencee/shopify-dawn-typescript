import { ModalDialog } from '@/scripts/theme/modal-dialog'
import {
	getAttributeOrThrow,
	qsaOptional,
	qsOptional,
	qsRequired,
	replaceAll,
} from '@/scripts/functions'
import { type CartNotification } from '@/scripts/theme/cart-notification'
import { type uCoastWindow } from '@/scripts/setup'
import { type CartDrawer } from '@/scripts/cart-drawer/cart-drawer'
import { type PickupAvailability } from '@/scripts/optional/pickup-availability'
import { type ProductModal } from '@/scripts/product/product-modal'
import { type VariantSelects } from '@/scripts/product/variant-selects'
import { type VariantRadios } from '@/scripts/product/variant-radios'
import { type ProductInfo } from '@/scripts/product/product-info'

declare let window: uCoastWindow

export class QuickAddModal extends ModalDialog {
	static override htmlSelector = 'quick-add-modal'
	productElement?: HTMLElement
	modalContent: HTMLElement
	constructor() {
		super()
		this.modalContent = qsRequired('[id^="QuickAddInfo-"]', this)
	}

	override hide(preventFocus = false) {
		const cartNotification =
			qsOptional<CartNotification>('cart-notification') ||
			qsRequired<CartDrawer>('cart-drawer')
		if (cartNotification && this.openedBy) cartNotification.setActiveElement(this.openedBy)
		this.modalContent.innerHTML = ''

		if (preventFocus) this.openedBy = undefined
		super.hide()
	}

	override show(opener: HTMLElement) {
		opener.setAttribute('aria-disabled', 'true')
		opener.classList.add('loading')
		qsRequired('.loading-overlay__spinner', opener).classList.remove('hidden')

		fetch(getAttributeOrThrow('data-product-url', opener))
			.then((response) => response.text())
			.then((responseText) => {
				const responseHTML = new DOMParser().parseFromString(responseText, 'text/html')
				this.productElement = qsRequired(
					'section[id^="MainProduct-"]',
					responseHTML.documentElement
				)
				this.preventDuplicatedIDs()
				this.removeDOMElements()
				this.setInnerHTML(this.modalContent, this.productElement.innerHTML)

				if (window.Shopify && window.Shopify.PaymentButton) {
					window.Shopify.PaymentButton.init()
				}

				if (window.ProductModel) window.ProductModel.loadShopifyXR()

				this.removeGalleryListSemantic()
				this.updateImageSizes()
				this.preventVariantURLSwitching()
				super.show(opener)
			})
			.finally(() => {
				opener.removeAttribute('aria-disabled')
				opener.classList.remove('loading')
				qsRequired('.loading-overlay__spinner', opener).classList.add('hidden')
			})
	}

	setInnerHTML(element: HTMLElement, html: string) {
		element.innerHTML = html

		// Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
		element.querySelectorAll('script').forEach((oldScriptTag: HTMLScriptElement) => {
			if (!oldScriptTag.parentNode)
				throw new Error('oldScriptTag.parentNode is null, cannot replace script')
			const newScriptTag = document.createElement('script')
			Array.from(oldScriptTag.attributes).forEach((attribute) => {
				newScriptTag.setAttribute(attribute.name, attribute.value)
			})
			newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML))
			oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag)
		})
	}

	preventVariantURLSwitching() {
		const variantPicker = this.modalContent.querySelector('variant-radios,variant-selects')
		if (!variantPicker) return

		variantPicker.setAttribute('data-update-url', 'false')
	}

	removeDOMElements() {
		if (!this.productElement)
			throw new Error('this.removeDOMElements called without this.productElement')
		qsOptional<PickupAvailability>('pickup-availability', this.productElement)?.remove()
		qsOptional<ProductModal>('product-modal', this.productElement)?.remove()
		const modalDialogs = qsaOptional<ModalDialog>('modal-dialog', this.productElement)
		if (modalDialogs) {
			modalDialogs.forEach((modal) => modal.remove())
		}
	}

	preventDuplicatedIDs() {
		if (!this.productElement)
			throw new Error('this.preventDuplicatedIDs called without this.productElement')
		const sectionId = getAttributeOrThrow('data-section', this.productElement)
		this.productElement.innerHTML = replaceAll(
			this.productElement.innerHTML,
			sectionId,
			`quickadd-${sectionId}`
		)
		const formComponents = qsaOptional<VariantSelects | VariantRadios | ProductInfo>(
			'variant-selects, variant-radios, product-info',
			this.productElement
		)
		formComponents?.forEach((element) => {
			element.dataset.originalSection = sectionId
		})
	}

	removeGalleryListSemantic() {
		const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]')
		if (!galleryList) return

		galleryList.setAttribute('role', 'presentation')
		galleryList
			.querySelectorAll('[id^="Slide-"]')
			.forEach((li) => li.setAttribute('role', 'presentation'))
	}

	updateImageSizes() {
		const product = qsRequired('.product', this.modalContent)
		const desktopColumns = product.classList.contains('product--columns')
		if (!desktopColumns) return

		const mediaImages = qsaOptional<HTMLImageElement>('.product__media img', product)
		if (!mediaImages) return

		let mediaImageSizes =
			'(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)'

		if (product.classList.contains('product--medium')) {
			mediaImageSizes = mediaImageSizes.replace('715px', '605px')
		} else if (product.classList.contains('product--small')) {
			mediaImageSizes = mediaImageSizes.replace('715px', '495px')
		}

		mediaImages.forEach((img: HTMLImageElement) => img.setAttribute('sizes', mediaImageSizes))
	}
}
