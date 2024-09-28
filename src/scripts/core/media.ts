import { UcoastVideo } from '@/scripts/core/ucoast-video'
import { throttle, TsDOM as q } from '@/scripts/core/TsDOM'
interface FadeOptions {
	duration?: number
	initialOpacity?: number
}

function fadeInElement(element: HTMLElement, options: FadeOptions = {}): void {
	const { duration = 300, initialOpacity = 0 } = options

	element.style.opacity = initialOpacity.toString()
	element.style.transition = `opacity ${duration}ms ease-in-out`

	const fadeIn = (): void => {
		element.style.opacity = '1'
	}

	requestAnimationFrame(fadeIn)
}

function handlePictureFadeIn(
	pictureElement: HTMLPictureElement,
	options: FadeOptions = {}
): void {
	const sources = q.ol<HTMLSourceElement>('source', pictureElement)
	const img = q.os<HTMLImageElement>('img', pictureElement)

	if (!img || !sources) {
		console.error('No img element found in picture')
		return
	}

	const loadHandler = (): void => {
		sources.forEach((source) =>
			source.removeEventListener('load', loadHandler)
		)
		img.removeEventListener('load', loadHandler)
		fadeInElement(pictureElement, options)
	}

	sources.forEach((source) => source.addEventListener('load', loadHandler))
	img.addEventListener('load', loadHandler)

	if (img.complete || Array.from(sources).some((source) => source.complete)) {
		loadHandler()
	}
}

function handleImgFadeIn(
	imgElement: HTMLImageElement,
	options: FadeOptions = {}
): void {
	if (imgElement.complete) {
		fadeInElement(imgElement, options)
	} else {
		imgElement.addEventListener('load', () =>
			fadeInElement(imgElement, options)
		)
	}
}

export class MediaManager {
	hlsRequired: boolean
	hlsLibraryLoaded: boolean
	lastKnownScrollPosition: number
	ticking: boolean
	Hls?: Hls
	playCallbacks: (() => void)[]
	hlsLibIsSupported = false
	lastKnownWindowWidth?: number
	videos: UcoastVideo[]

	constructor() {
		this.hlsLibraryLoaded = false
		this.lastKnownScrollPosition = 0
		this.ticking = false
		this.playCallbacks = []
		this.hlsRequired = this.isHlsRequired()
		this.videos = Array.from(q.ol<UcoastVideo>('ucoast-video') ?? [])
	}

	// public methods
	async initialLoad() {
		document.addEventListener('DOMContentLoaded', () => {
			// image fade in
			document
				.querySelectorAll('picture, img.no-picture')
				.forEach((element: Element) => {
					const options: FadeOptions = {
						duration: 300,
						initialOpacity: 0,
					}

					if (element instanceof HTMLPictureElement) {
						handlePictureFadeIn(element, options)
					} else if (
						element instanceof HTMLImageElement &&
						element.classList.contains('no-picture')
					) {
						handleImgFadeIn(element, options)
					}
				})
			// video autoplay inits
			this.loadHls()
			this.initEventListeners()
		})
	}

	private initEventListeners() {
		window.addEventListener('resize', () => {
			const currentWidth = window.innerWidth
			if (currentWidth !== this.lastKnownWindowWidth) {
				this.lastKnownWindowWidth = currentWidth
			}
			this.updateOnScroll()
		})

		window.addEventListener(
			'scroll',
			throttle(() => {
				this.handleScroll()
			}),
			{ passive: true }
		)
		this.updateOnScroll()
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
		if (!this.videos.length) return
		this.videos.forEach((video) => {
			// note: video.play() and video.pause() are not html5 video methods
			// on the ucoast-video component, they check several conditions to determine if the play/pause should be allowed
			// outside of these basic conditions, any additional conditions for play/pause should be added there
			if (
				!this.isTouchingViewport(video.videoEl) ||
				video.isHiddenForViewport()
			) {
				void video.pause()
			} else {
				void video.play()
			}
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
		const video = document.createElement('video')
		return video.canPlayType('application/vnd.apple.mpegurl') === ''
	}

	private async loadHls() {
		if (!this.hlsRequired) return

		try {
			// ignoring because types are defined through global
			// @ts-ignore
			const hlsLib: Hls = await import('hls.js/dist/hls.light.min.js')
			this.hlsLibIsSupported = hlsLib.isSupported()
			this.Hls = hlsLib
			this.Hls.defaultConfig = {
				videoPreference: {
					preferHDR: true,
				},
				capLevelToPlayerSize: true,
				backBufferLength: 2,
			}
			this.hlsLibraryLoaded = true
			q.ol<UcoastVideo>('ucoast-video')?.forEach((video) => {
				void video.onLibraryLoad()
			})
		} catch (error) {
			console.error('Failed to load the HLS library', error)
		}
	}

	async playAllInContainer(container: HTMLElement) {
		const videosInContainer = q.ol<UcoastVideo>('ucoast-video', container)
		if (!videosInContainer) return
		videosInContainer.forEach((video) => {
			void video.playEventOn()
		})
	}

	async pauseAllInContainer(container: HTMLElement) {
		const videosInContainer = q.ol<UcoastVideo>('ucoast-video', container)
		if (!videosInContainer) return
		videosInContainer.forEach((video) => {
			void video.pause()
		})
	}
}
