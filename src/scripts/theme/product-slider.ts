import { UcoastEl } from '@/scripts/core/UcoastEl'
import EmblaCarousel, {
	EmblaCarouselType,
	EmblaOptionsType,
} from 'embla-carousel'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import ClassNames from 'embla-carousel-class-names'
import AutoHeight from 'embla-carousel-auto-height'
import { getSectionHTMLForResource } from '@/scripts/core/cart-functions'

export class ProductSlider extends UcoastEl {
	static htmlSelector = 'product-slider'
	dynamicContentContainer: HTMLElement
	collectionUrl: string
	uniqueId: string
	defer: boolean
	initialized: boolean = false
	emblaApi?: EmblaCarouselType
	disableAutoHeight?: boolean = false
	constructor() {
		super()
		this.defer = this.hasAttribute('data-uc-animate')
		if (this.hasAttribute('data-disable-auto-height')) {
			this.disableAutoHeight = true
		}
		this.dynamicContentContainer = q.rs(
			'[data-dynamic-content]',
			this
		)
		this.collectionUrl = q.ra(this, 'data-collection-url')
		this.uniqueId = q.ra(this, 'data-unique-id')

		if (!this.defer) {
			// if the form is statically loaded, we need to initialize variantData outside the async flow

			void this.initializeSlider()
		}
	}

	override animateIn() {
		super.animateIn()
		void this.initializeSlider()
	}

	async renderDynamicContent() {
		if (!this.dynamicContentContainer) return
		const content = await getSectionHTMLForResource(
			this.collectionUrl,
			'dynamic-product-list'
		)
		if (!content) return
		const contentWithUniqueId = content.replaceAll(
			'_dynamic_section_id_',
			this.uniqueId
		)
		this.dynamicContentContainer.innerHTML = contentWithUniqueId
		await window.Ucoast.mediaManager.preloadContainer(this.dynamicContentContainer)
		window.setTimeout(() => {
			this.classList.add('loaded')
		}, 5)
	}

	async initializeSlider() {
		if (this.initialized) return
		if (this.defer) {
			await this.renderDynamicContent()
		}
		const OPTIONS: EmblaOptionsType = {
			slidesToScroll: 'auto',
			align: 'center',
			containScroll: 'keepSnaps',
			dragFree: true,
			duration: 100,
			dragThreshold: 100,
		}

		const viewportNode = q.rs('.embla__viewport', this)
		try {
			if (this?.disableAutoHeight) {
				this.emblaApi = EmblaCarousel(viewportNode, OPTIONS, [
					WheelGesturesPlugin(),
					ClassNames(),
				])
			} else {
				this.emblaApi = EmblaCarousel(viewportNode, OPTIONS, [
					WheelGesturesPlugin(),
					ClassNames(),
					AutoHeight(),
				])
			}
		} catch (e) {
			console.error(e)
		}
		if (!this.defer) {
			await window.Ucoast.mediaManager.preloadContainer(this)
		}
		this.initialized = true
	}
}
