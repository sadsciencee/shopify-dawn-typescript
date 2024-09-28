import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type ProductModal } from '@/scripts/product/product-modal'
import { type SlideshowComponent } from '@/scripts/theme/slideshow-component'
import { mediaLoader } from '@/scripts/core/global';
export function initializeThemeEditor() {
	function hideProductModal() {
		const productModal = q.ol<ProductModal>('product-modal[open]')
		productModal && productModal.forEach((modal) => modal.hide())
	}

	document.addEventListener('shopify:block:select', function (event: Event) {
		hideProductModal()
		const target = q.rt(event)
		const blockSelectedIsSlide = target.classList.contains('slideshow__slide')
		if (!blockSelectedIsSlide) return

		const parentSlideshowComponent = q.oc<SlideshowComponent>(
			target,
			'slideshow-component'
		)
		if (!parentSlideshowComponent) return
		parentSlideshowComponent.pause()

		setTimeout(function () {
			parentSlideshowComponent.slider.scrollTo({
				left: target.offsetLeft,
			})
		}, 200)
	})

	document.addEventListener('shopify:block:deselect', function (event) {
		const target = q.rt(event)
		const blockDeselectedIsSlide = target.classList.contains('slideshow__slide')
		if (!blockDeselectedIsSlide) return
		const parentSlideshowComponent = q.oc<SlideshowComponent>(
			target,
			'slideshow-component'
		)
		if (!parentSlideshowComponent) return
		if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play()
	})

	document.addEventListener('shopify:section:load', () => {
		mediaLoader()
		hideProductModal()
		const zoomOnHoverScripts = q.ol<HTMLScriptElement>('[id^=EnableZoomOnHover] script')
		zoomOnHoverScripts?.forEach((zoomOnHoverScript) => {
			const zoomOnHoverScriptParent = zoomOnHoverScript.parentNode
			if (!zoomOnHoverScriptParent) return
			const newScriptTag = document.createElement('script')
			newScriptTag.src = zoomOnHoverScript.src
			zoomOnHoverScriptParent.replaceChild(newScriptTag, zoomOnHoverScript)
		})

	})

	document.addEventListener('shopify:section:reorder', () => hideProductModal())

	document.addEventListener('shopify:section:select', () => hideProductModal())

	document.addEventListener('shopify:section:deselect', () => hideProductModal())

	document.addEventListener('shopify:inspector:activate', () => hideProductModal())

	document.addEventListener('shopify:inspector:deactivate', () => hideProductModal())
}
