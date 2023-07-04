import {
	debounce,
	getAttributeOrThrow,
	pauseAllMedia,
	qsOptional,
	qsRequired,
} from '@/scripts/functions'
import { SliderComponent } from '@/scripts/theme/slider-component'
import { type uCoastWindow } from '@/scripts/setup'
import { StickyHeader } from '@/scripts/theme/sticky-header'
import { DeferredMedia } from '@/scripts/theme/deferred-media'
import { SlideChangedEvent } from '@/scripts/types/events'

declare let window: uCoastWindow

export class MediaGallery extends HTMLElement {
	elements: {
		liveRegion: HTMLElement
		viewer: HTMLElement | SliderComponent
		thumbnails?: SliderComponent
	}
	mql: MediaQueryList
	stickyHeader?: StickyHeader
	constructor() {
		super()
		this.elements = {
			liveRegion: qsRequired('[id^="GalleryStatus"]', this),
			viewer: qsRequired('[id^="GalleryViewer"]', this),
			thumbnails: qsOptional('[id^="GalleryThumbnails"]', this),
		}
		this.mql = window.matchMedia('(min-width: 750px)')
		if (!this.elements.thumbnails) return

		this.elements.viewer.addEventListener(
			'slideChanged',
			debounce(this.onSlideChanged.bind(this), 500)
		)
		this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
			if (!(mediaToSwitch instanceof HTMLElement)) return
			const button = qsRequired('button', mediaToSwitch)
			button.addEventListener(
				'click',
				this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false)
			)
		})
		if (this.dataset.desktopLayout?.includes('thumbnail') && this.mql.matches)
			this.removeListSemantic()
	}

	getActiveMediaParent(mediaId: string) {
		return qsRequired(`[data-media-id="${mediaId}"]`, this.elements.viewer, 'parentElement')
	}

	getActiveThumbnail(mediaId: string) {
		if (!this.elements.thumbnails) throw new Error('thumbnails is null')
		return qsRequired(`[data-target="${mediaId}"]`, this.elements.thumbnails)
	}

	onSlideChanged(event: SlideChangedEvent) {
		if (!this.elements.thumbnails) return
		const mediaId = getAttributeOrThrow('data-media-id', event.detail.currentElement)
		const thumbnail = this.getActiveThumbnail(mediaId)
		this.setActiveThumbnail(thumbnail)
	}

	setActiveMedia(mediaId: string, prepend: boolean) {
		const activeMedia = qsRequired(`[data-media-id="${mediaId}"]`, this.elements.viewer)
		this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
			element.classList.remove('is-active')
		})
		activeMedia.classList.add('is-active')

		if (prepend) {
			const activeMediaParent = this.getActiveMediaParent(mediaId)
			activeMediaParent.prepend(activeMedia)
			if (this.elements.thumbnails) {
				const activeThumbnail = this.getActiveThumbnail(mediaId)
				activeMediaParent.prepend(activeThumbnail)
			}
			if (this.elements.viewer instanceof SliderComponent) this.elements.viewer.resetPages()
		}

		this.preventStickyHeader()
		window.setTimeout(() => {
			if (this.elements.thumbnails) {
				const activeMediaParent = this.getActiveMediaParent(mediaId)
				activeMediaParent.scrollTo({ left: activeMedia.offsetLeft })
			}
			if (!this.elements.thumbnails || this.dataset.desktopLayout === 'stacked') {
				activeMedia.scrollIntoView({ behavior: 'smooth' })
			}
		})
		this.playActiveMedia(activeMedia)

		if (!this.elements.thumbnails) return
		const activeThumbnail = this.getActiveThumbnail(mediaId)
		this.setActiveThumbnail(activeThumbnail)
		this.announceLiveRegion(activeMedia, getAttributeOrThrow('media-position', activeThumbnail))
	}

	setActiveThumbnail(thumbnail: HTMLElement) {
		if (!this.elements.thumbnails || !thumbnail) return

		this.elements.thumbnails
			.querySelectorAll('button')
			.forEach((element) => element.removeAttribute('aria-current'))
		const button = qsRequired('button', thumbnail)
		button.setAttribute('aria-current', 'true')
		if (this.elements.thumbnails && this.elements.thumbnails.isSlideVisible(thumbnail, 10))
			return

		this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft })
	}

	announceLiveRegion(activeItem: HTMLElement, position: string) {
		const image = qsRequired<HTMLImageElement>('.product__modal-opener--image img', activeItem)
		if (!image) return
		image.onload = () => {
			this.elements.liveRegion.setAttribute('aria-hidden', 'false')
			this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace(
				'[index]',
				position
			)
			setTimeout(() => {
				this.elements.liveRegion.setAttribute('aria-hidden', 'true')
			}, 2000)
		}
		image.src = image.src
	}

	playActiveMedia(activeItem: HTMLElement) {
		pauseAllMedia()
		const deferredMedia = qsOptional<DeferredMedia>('.deferred-media', activeItem)
		if (deferredMedia) deferredMedia.loadContent(false)
	}

	preventStickyHeader() {
		this.stickyHeader = this.stickyHeader || qsRequired<StickyHeader>('sticky-header')
		if (!this.stickyHeader) return
		this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'))
	}

	removeListSemantic() {
		if (!(this.elements.viewer instanceof SliderComponent)) return
		this.elements.viewer.slider.setAttribute('role', 'presentation')
		this.elements.viewer.sliderItems.forEach((slide) =>
			slide.setAttribute('role', 'presentation')
		)
	}
}
