import { ModalDialog } from '@/scripts/theme/modal-dialog'
import {
	replaceAll,
} from '@/scripts/core/global'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type CartNotification } from '@/scripts/theme/cart-notification'
import { type CartDrawer } from '@/scripts/cart/cart-drawer'
import { type PickupAvailability } from '@/scripts/optional/pickup-availability'
import { type ProductModal } from '@/scripts/product/product-modal'
import { type VariantSelects } from '@/scripts/theme/variant-selects'
import { type VariantRadios } from '@/scripts/theme/variant-radios'
import { type ProductInfo } from '@/scripts/product/product-info'
import { ATTRIBUTES, SELECTORS } from '@/scripts/core/global';

export class QuickAddModal extends ModalDialog {
	static override htmlSelector = 'quick-add-modal'
	productElement?: HTMLElement
	modalContent: HTMLElement
	constructor() {
		super()
		this.modalContent = q.rs('[id^="QuickAddInfo-"]', this)
	}

	override hide(preventFocus: boolean) {
		const cartNotification =
			q.os<CartNotification>('cart-notification') ||
			q.rs<CartDrawer>('cart-drawer')
		if (cartNotification && this.openedBy) cartNotification.setActiveElement(this.openedBy)
		this.modalContent.innerHTML = ''

		super.hide(preventFocus)
	}

	override show(opener: HTMLElement) {
		opener.setAttribute('aria-disabled', 'true')
		opener.setAttribute(ATTRIBUTES.loading, '')
		q.rs(SELECTORS.loadingOverlaySpinner, opener).classList.remove('hidden')

		fetch(q.ra(opener, 'data-product-url'))
			.then((response) => response.text())
			.then((responseText) => {
				const responseHTML = new DOMParser().parseFromString(responseText, 'text/html')
				this.productElement = q.rs(
					'section[id^="MainProduct-"]',
					responseHTML.documentElement
				)
				this.preventDuplicatedIDs()
				this.removeDOMElements()
				this.setInnerHTML(this.modalContent, this.productElement.innerHTML)
				void window.Ucoast.mediaManager.playAllInContainer(this.modalContent)

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
				opener.removeAttribute(ATTRIBUTES.loading)
				q.rs(SELECTORS.loadingOverlaySpinner, opener).classList.add('hidden')
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
		q.os<PickupAvailability>('pickup-availability', this.productElement)?.remove()
		q.os<ProductModal>('product-modal', this.productElement)?.remove()
		const modalDialogs = q.ol<ModalDialog>('modal-dialog', this.productElement)
		if (modalDialogs) {
			modalDialogs.forEach((modal) => modal.remove())
		}
	}

	preventDuplicatedIDs() {
		if (!this.productElement)
			throw new Error('this.preventDuplicatedIDs called without this.productElement')
		const sectionId = q.ra(this.productElement, 'data-section')
		this.productElement.innerHTML = replaceAll(
			this.productElement.innerHTML,
			sectionId,
			`quickadd-${sectionId}`
		)
		const formComponents = q.ol<VariantSelects | VariantRadios | ProductInfo>(
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
		const product = q.rs('.product', this.modalContent)
		const desktopColumns = product.classList.contains('product--columns')
		if (!desktopColumns) return

		const mediaImages = q.ol<HTMLImageElement>('.product__media img', product)
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
