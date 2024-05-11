import { UcoastEl } from '@/scripts/core/UcoastEl'
import { qsRequired } from '@/scripts/core/global'
import { type Hls } from '@/scripts/global'


function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export class UcoastVideo extends UcoastEl {
	static htmlSelector = 'ucoast-video'
	videoEl: HTMLVideoElement
	hasHls: boolean
	hlsReady: boolean
	hlsSource?: string
	mp4Source?: string
	initialized = false
	preloaded: boolean
	isLoading: boolean
	isPlaying: boolean
	hasPlayed: boolean
	hlsInstance: Hls

	constructor() {
		super()
		const { videoEl, hasHls, hlsReady, hlsSource, mp4Source } = this.init()
		this.videoEl = videoEl
		this.hasHls = hasHls
		this.hlsReady = hlsReady
		this.hlsSource = hlsSource
		this.mp4Source = mp4Source
		this.preloaded = false
		this.isLoading = false
		this.hasPlayed = false
		this.isPlaying = false
	}

	init() {
		const videoEl = qsRequired<HTMLVideoElement>('video', this)
		const hlsSource = videoEl.getAttribute('data-hls-src') ?? undefined
		const hasHls = hlsSource !== undefined
		this.initialized = true
		return {
			videoEl,
			hasHls,
			hlsReady: false,
			hlsSource,
			mp4Source: videoEl.getAttribute('data-mp4-src') ?? undefined,
		}
	}

	override async connectedCallback() {
		super.connectedCallback()
	}

	async play() {
		if (this.isHiddenForViewport()) return
		// if (this.isPlaying || this.isLoading) return
		if (this.isPlaying) return

		this.isLoading = true
		if (
			window.Ucoast.mediaManager.hlsRequired &&
			window.Ucoast.mediaManager.hlsLibraryLoaded &&
			!this.hasPlayed
		) {
			await this.playHLS()
		} else {
			await this.playStandard()
		}
	}

	async preload() {
		if (
			this.isPlaying ||
			this.preloaded ||
			this.hasPlayed ||
			this.isLoading
		)
			return

		if (this.isHiddenForViewport()) return

		this.isLoading = true
		if (
			window.Ucoast.mediaManager.hlsRequired &&
			window.Ucoast.mediaManager.hlsLibraryLoaded &&
			!this.hasPlayed
		) {
			await this.preloadHLS()
			this.isLoading = false
		} else {
			if (this.hlsSource) {
				this.videoEl.src = this.hlsSource
			}
			await this.preloadStandard()
			this.isLoading = false
		}
	}

	async playStandard() {
		this.videoEl.muted = true
		this.videoEl.currentTime = 0
		await sleep(1)
		this.setAttribute('data-uc-has-played', 'true')
		await this.videoEl.play()
		this.isLoading = false
		this.hasPlayed = true
		this.preloaded = true
		this.isPlaying = true
	}

	async preloadStandard() {
		this.videoEl.muted = true
		await this.videoEl.play()
		this.isLoading = false
		this.hasPlayed = true
		this.preloaded = true
		this.isPlaying = true
		this.setAttribute('data-uc-has-played', 'true')
		window.setTimeout(() => {
			this.videoEl.pause()
			this.isPlaying = false
		}, 3)
	}

	async preloadHLS() {
		if (
			window.Ucoast.mediaManager.hlsLibIsSupported &&
			this.hlsSource &&
			!this.preloaded
		) {
			this.hlsInstance = new window.Ucoast.mediaManager.Hls.default()
			this.hlsInstance.on('hlsMediaAttached', async () => {
				await this.preloadStandard()
			})

			this.videoEl.src = this.hlsSource
			await this.hlsInstance.loadSource(this.hlsSource)
			await this.hlsInstance.attachMedia(this.videoEl)
		} else {
			await this.preloadStandard()
		}
	}

	async playHLS() {
		if (
			window.Ucoast.mediaManager.hlsLibIsSupported &&
			this.hlsSource &&
			!this.preloaded
		) {
			this.hlsInstance = new window.Ucoast.mediaManager.Hls.default()
			this.hlsInstance.on('hlsMediaAttached', async () => {
				await this.playStandard()
			})

			this.videoEl.src = this.hlsSource
			await this.hlsInstance.loadSource(this.hlsSource)
			await this.hlsInstance.attachMedia(this.videoEl)
		} else {
			await this.playStandard()
		}
	}

	async pause() {
		this.videoEl.pause()
		this.videoEl.currentTime = 0
		this.isPlaying = false
	}

	isHiddenForViewport() {
		return (
			this.videoEl.getBoundingClientRect().height < 1 ||
			this.videoEl.getBoundingClientRect().width < 1
		)
	}
}
