import { UcoastEl } from '@/scripts/core/UcoastEl'
import { isTenPercentInViewport, qsRequired } from '@/scripts/core/global'
import { uCoastWindow } from '@/scripts/setup'

declare let window: uCoastWindow
export class UcoastVideo extends UcoastEl {
	static htmlSelector = 'ucoast-video'
	static hlsLoaded = false
	videoEl: HTMLVideoElement
	hasHls: boolean
	hlsReady: boolean
	hlsSource?: string
	mp4Source?: string
	initialized = false

	constructor() {
		super()
		const { videoEl, hasHls, hlsReady, hlsSource, mp4Source } = this.init()
		this.videoEl = videoEl
		this.hasHls = hasHls
		this.hlsReady = hlsReady
		this.hlsSource = hlsSource
		this.mp4Source = mp4Source
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

	setHasPlayed() {
		this.setAttribute('data-uc-has-played', 'true')
	}
	hasPlayed() {
		const hasPlayed = this.getAttribute('data-uc-has-played') === 'true'
		return hasPlayed
	}
	override async connectedCallback() {
		super.connectedCallback()
		if (
			this.hasHls &&
			!this.hlsReady &&
			!this.videoEl.canPlayType('application/vnd.apple.mpegurl') &&
			!UcoastVideo.hlsLoaded
		) {
			console.log('loading hls')
			const { loadHls } = await import(`@/scripts/hls`)
			await loadHls()
		} else if (
			this.hasHls &&
			this.videoEl.canPlayType('application/vnd.apple.mpegurl') &&
			this.hlsSource
		) {
			this.videoEl.setAttribute('src', this.hlsSource)
			await this.playIfInView()
		} else if (this.mp4Source) {
			this.videoEl.setAttribute('src', this.mp4Source)
			await this.playIfInView()
		}
	}
	async playIfInView() {
		if (isTenPercentInViewport(this.videoEl) && this.videoEl.paused) {
			await this.play()
		}
	}
	async preload() {
		if (this.hasPlayed() && !this.videoEl.paused) return
		await this.videoEl.play()
		window.setTimeout(() => {
			this.removeAttribute('data-uc-preloading')
			if (!isTenPercentInViewport(this.videoEl)) {
				console.log('pausing')
				void this.pause()
				this.videoEl.currentTime = 0
			}
		}, 100)
	}
	async play() {
		if (!this.hasPlayed()) {
			this.preload().then(() => {
				this.videoEl.play()
				this.setHasPlayed()
			})
		}
		else if (this.videoEl.paused) {
			this.videoEl
				.play()
				.then(() => {
					this.setHasPlayed()
				})
				.catch((e) => console.log('error playing video', e))
		} else {
			console.log('video is already palying')
		}
	}
	async pause() {
		if (!this.videoEl.paused && this.hasPlayed()) {
			await this.videoEl.pause()
		}
	}
}
