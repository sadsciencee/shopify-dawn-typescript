import { UcoastVideo } from '@/scripts/core/ucoast-video'
import { type Hls } from '../global'
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class MediaManager {
	hlsRequired: boolean
	hlsLibraryLoaded: boolean
	lastKnownScrollPosition: number
	ticking: boolean
	Hls?: Hls
	playCallbacks: (() => void)[]
	hlsLibIsSupported = false
	lastKnownWindowWidth?: number

	constructor() {
		this.hlsLibraryLoaded = false
		this.lastKnownScrollPosition = 0
		this.ticking = false
		this.playCallbacks = []
		this.hlsRequired = this.isHlsRequired()
	}

	// public methods
	async initialLoad() {
		this.setImageDataSrcs(this.selectAllImages())
		this.loadImagesImmediately(this.selectImagesInViewport())
		if (this.hlsRequired && !this.hlsLibraryLoaded) {
			await this.loadHls()
		}
		this.playVideosImmediately(this.selectVideosInViewport())
		this.initEventListeners()
	}

	async reload() {
		this.loadImagesImmediately(this.selectImagesInNextOrPreviousViewport())
		const videosToPlay = this.selectVideosInViewport()
		this.playVideosImmediately(videosToPlay)
	}

	async reloadAllDangerously() {
		const images: HTMLImageElement[] = Array.from(
			document.querySelectorAll('img[data-srcset]')
		)
		const videos: UcoastVideo[] = Array.from(
			document.querySelectorAll('ucoast-video')
		)
		this.loadImagesImmediately(images)
		this.playVideosImmediately(videos)
	}

	async preloadContainer(container: HTMLElement) {
		this.setImageDataSrcs(this.selectAllImages())
		this.loadImagesImmediately(this.selectImagesInViewport())
		this.enableLazyLoad(this.selectAllImages(container))
		const videos = this.selectAllVideos(container)
		this.preloadSelectedVideos(videos)
	}

	async loadAllInContainer(container: HTMLElement) {
		const images = Array.from(container.querySelectorAll('img'))
		const videos: UcoastVideo[] = Array.from(
			container.querySelectorAll('ucoast-video')
		)
		this.loadImagesImmediately(images)
		this.playVideosImmediately(videos)
	}

	async pauseAllInContainer(container: HTMLElement) {
		const videos: UcoastVideo[] = Array.from(
			container.querySelectorAll('ucoast-video')
		)
		videos.forEach((video) => {
			video.pause()
		})
	}

	// scroll update pattern

	private initEventListeners() {
		window.addEventListener('resize', () => {
			const currentWidth = window.innerWidth;
			if (currentWidth !== this.lastKnownWindowWidth) {
				this.lastKnownWindowWidth = currentWidth;
			}
			this.updateOnScroll()
		});
		window.addEventListener('scroll', () => this.handleScroll(), {
			passive: true,
		})
	}

	private handleScroll() {
		this.lastKnownScrollPosition = window.scrollY

		if (!this.ticking) {
			window.requestAnimationFrame(() => {
				this.updateOnScroll()
				this.ticking = false
			})

			this.ticking = true
		}
	}

	private updateOnScroll() {
		const imagesInViewport = this.selectImagesInViewport()
		this.loadImagesImmediately(imagesInViewport)
		const imagesNearViewport = this.selectImagesInNextOrPreviousViewport()
		this.loadImagesImmediately(imagesNearViewport)
		const videosToPreload =
			this.selectUnloadedVideosInNextOrPreviousViewport()
		this.preloadSelectedVideos(videosToPreload)
		const videosToPlay = this.selectVideosInViewport()
		this.playVideosImmediately(videosToPlay)
	}

	// play or load actions

	private setImageDataSrcs(images: HTMLImageElement[]) {
		images.forEach((img) => this.setImageDataSrc(img))
	}

	private enableLazyLoad(images: HTMLImageElement[]) {
		images.forEach((img) => {
			this.setImageDataSrc(img)
			const dataSrc = q.ra(img, 'data-src')
			img.setAttribute('src', dataSrc)
			img.setAttribute('loading', 'lazy')
		})
	}

	private setImageDataSrc(image: HTMLImageElement) {
		const srcSet = image.getAttribute('data-srcset')
		if (!srcSet) return
		const devicePixelRatio = window.devicePixelRatio ?? 2
		const targetSize = (
			image.getBoundingClientRect().width * devicePixelRatio
		).toFixed(0)
		let newSrc = image.getAttribute('src')
		if (!newSrc || !newSrc.includes('&width=')) return
		const srcArr = newSrc.split('&width=')
		newSrc = `${srcArr[0]}&width=${targetSize}`

		if (targetSize === '0' || targetSize === '') {
			return
		}

		image.setAttribute('data-src', newSrc)
	}

	private preloadSelectedVideos(videos: UcoastVideo[]) {
		videos.forEach((video) => {
			void video.preload()
		})
	}

	private loadImagesImmediately(images: HTMLImageElement[]) {
		this.setImageDataSrcs(images)
		images.forEach((image) => {
			if (image.getBoundingClientRect().width === 0) return
			if (image.hasAttribute('data-loaded')) {
				const dataSrc = q.ra(image, 'data-src')
				image.setAttribute('src', dataSrc)
			} else {
				const dataSrc = q.ra(image, 'data-src')
				image.removeAttribute('loading')
				let preloadedImage = new Image()
				preloadedImage.src = dataSrc
				image.setAttribute('loading', 'eager')
				image.setAttribute('src', dataSrc)
				image.setAttribute('data-loaded', 'true')
			}
		})
	}

	private playVideosImmediately(videos: UcoastVideo[]) {
		videos.forEach((video) => {
			void video.play()
		})
	}

	// select methods

	private selectVideosInViewport(container?: HTMLElement) {
		return this.selectAllVideos(container).filter((video) => {
			return this.isTouchingViewport(video)
		})
	}

	private selectAllVideos(container?: HTMLElement) {
		const els: NodeListOf<UcoastVideo> = container
			? container.querySelectorAll('ucoast-video')
			: document.querySelectorAll(
					'ucoast-video:not([data-uc-load-on-event])'
				)

		return Array.from(els)
	}

	private selectAllImages(container?: HTMLElement) {
		const els: NodeListOf<HTMLImageElement> = container
			? container.querySelectorAll('img[data-srcset]')
			: document.querySelectorAll(
					'img[data-srcset]:not([data-uc-load-on-event])'
				)
		return Array.from(els)
	}

	private selectImagesInViewport(
		container?: HTMLElement
	): HTMLImageElement[] {
		return this.selectAllImages(container).filter((img) => {
			return this.isTouchingViewport(img)
		})
	}

	private selectImagesInNextOrPreviousViewport(): HTMLImageElement[] {
		return this.selectAllImages()
			.filter((img) => {
				return this.isInNextOrPreviousViewport(img)
			})
	}

	private selectUnloadedVideosInNextOrPreviousViewport(): UcoastVideo[] {
		return this.selectAllVideos()
			.filter((video) => {
				const allowLoading =
					!video.preloaded &&
					!video.isLoading &&
					!video.hasPlayed &&
					!video.isPlaying &&
					!video.hasAttribute('data-uc-has-played')
				return allowLoading
			})
			.filter((video) => {
				return this.isInNextOrPreviousViewport(video)
			})
	}

	// viewport detection

	private isTouchingViewport(el: HTMLElement) {
		const rect = el.getBoundingClientRect()

		const isVisible =
			rect.top < window.innerHeight &&
			rect.bottom > 0 &&
			rect.left < window.innerWidth &&
			rect.right > 0

		return isVisible
	}

	private isInNextOrPreviousViewport(el: HTMLElement) {
		const rect = el.getBoundingClientRect()

		const isVisibleOrNear =
			rect.top < window.innerHeight * 2 &&
			rect.bottom > -window.innerHeight &&
			rect.left < window.innerWidth &&
			rect.right > 0

		return isVisibleOrNear || this.isTouchingViewport(el)
	}

	// hls

	private isHlsRequired() {
		const video = q.os<UcoastVideo>('ucoast-video')
		if (!video) {
			return false
		}
		if (window.innerWidth < 800) {
			return false
		}
		if (
			video &&
			video.videoEl.canPlayType('application/vnd.apple.mpegurl')
		) {
			return false
		}
		return true
	}

	private async loadHls() {
		if (!this.hlsRequired) return

		try {
			// ignoring because types are defined through global
			// @ts-ignore
			const hlsLib = await import('hls.js/dist/hls.light.min.js')
			this.hlsLibIsSupported = hlsLib.isSupported()
			this.Hls = hlsLib
			this.hlsLibraryLoaded = true
		} catch (error) {
			console.error('Failed to load the HLS library', error)
		}
	}
}
