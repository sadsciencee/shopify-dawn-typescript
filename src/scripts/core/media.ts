import { UcoastVideo } from '@/scripts/core/ucoast-video'
import { throttle, TsDOM as q } from '@/scripts/core/TsDOM'
interface FadeOptions {
	duration?: number
	initialOpacity?: number
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
	videoObserver: IntersectionObserver

	constructor() {
		this.hlsLibraryLoaded = false
		this.lastKnownScrollPosition = 0
		this.ticking = false
		this.playCallbacks = []
		this.hlsRequired = this.isHlsRequired()
		//this.videos = Array.from(q.ol<UcoastVideo>('ucoast-video') ?? [])
		this.videos = []
		this.videoObserver = new IntersectionObserver(
			this.onIntersection.bind(this),
			{
				rootMargin: '0px 0px -50px 0px',
			}
		)
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
			this.loadEarlyVideos()
		})
	}

	private initEventListeners() {
		window.addEventListener('resize', () => {
			const currentWidth = window.innerWidth
			if (currentWidth !== this.lastKnownWindowWidth) {
				this.lastKnownWindowWidth = currentWidth
			}
			//this.updateOnScroll()
		})
		/*
		window.addEventListener(
			'scroll',
			throttle(() => {
				this.handleScroll()
			}),
			{ passive: true }
		)
		this.updateOnScroll()*/
	}
	loadEarlyVideos() {
		if (this.hlsRequired) return
		const videos = q.ol<UcoastVideo>('ucoast-video[data-retry="true"]')
		if (!videos) return
		videos.forEach((video) => {
			video.unMarkForRetry()
			void video.onConnectedCallback()
		})
	}

	onIntersection(
		elements: IntersectionObserverEntry[],
		observer: IntersectionObserver
	) {
		elements.forEach((element, index) => {
			if (element.isIntersecting) {
				const elementTarget: UcoastVideo = element.target
				void elementTarget.play()
			} else {
				const elementTarget: UcoastVideo = element.target
				elementTarget.pause()
			}
		})
	}

	addVideo(video: UcoastVideo) {
		if (!this.videos.some((item) => video === item)) {
			this.videoObserver.observe(video)
			this.videos.push(video)
		}
	}
	removeVideo(video: UcoastVideo) {
		this.videoObserver.unobserve(video)
		this.videos = this.videos.filter((item) => video !== item)
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

// ai image fade functions that dont really work

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
