import { UcoastEl } from '@/scripts/core/UcoastEl'
import { isTenPercentInViewport, qsRequired } from '@/scripts/functions'
import { uCoastWindow } from '@/scripts/setup'
import {HlsLoader} from '@/scripts/core/hls-loader';

declare let window: uCoastWindow
export class UcoastVideo extends UcoastEl {
	static htmlSelector = 'ucoast-video'
	hlsLoader: HlsLoader
	videoEl: HTMLVideoElement
	hasHls: boolean
	hlsReady: boolean
	hlsSource?: string
	mp4Source?: string
	initialized = false
	hasPlayed = false

	constructor() {
		super()
		const { hlsLoader, videoEl, hasHls, hlsReady, hlsSource, mp4Source } = this.init()
		this.hlsLoader = hlsLoader
		this.videoEl = videoEl
		this.hasHls = hasHls
		this.hlsReady = hlsReady
		this.hlsSource = hlsSource
		this.mp4Source = mp4Source
	}
	init() {
		const hlsLoader = qsRequired<HlsLoader>('hls-loader')
		const videoEl = qsRequired<HTMLVideoElement>('video', this)
		const hlsSource = videoEl.getAttribute('data-hls-src') ?? undefined
		const hasHls = hlsSource !== undefined
		this.initialized = true
		return {
			hlsLoader,
			videoEl,
			hasHls,
			hlsReady: false,
			hlsSource,
			mp4Source: videoEl.getAttribute('data-mp4-src') ?? undefined,
		}
	}
	override connectedCallback() {
		super.connectedCallback()
		if (
			this.hasHls &&
			!this.hlsReady &&
			!this.videoEl.canPlayType('application/vnd.apple.mpegurl') &&
			!this.hlsLoader.loading &&
			this.hlsLoader.loaded
		) {
			void this.hlsLoader.loadHlsScript()
		} else if (
			this.hasHls &&
			this.videoEl.canPlayType('application/vnd.apple.mpegurl') &&
			this.hlsSource
		) {
			this.videoEl.setAttribute('src', this.hlsSource)
			void this.playIfInView()
		} else if (this.mp4Source) {
			this.videoEl.setAttribute('src', this.mp4Source)
			void this.playIfInView()
		}
	}
	async playIfInView() {
		console.log('playIfInView check')
		if (isTenPercentInViewport(this.videoEl) && this.videoEl.paused) {
			console.log('playIfInView')
			await this.play()
		}
	}
	async preload() {
		if (this.hasPlayed && !this.videoEl.paused) return
		await this.videoEl.play()
		window.setTimeout(() => {
			this.removeAttribute('data-uc-preloading')
			if (!isTenPercentInViewport(this.videoEl)) {
				console.log('pause if out of view')
				void this.pause()
				this.videoEl.currentTime = 0
			}
		}, 100)
	}
	async play() {
		if (this.videoEl.paused) {
			this.videoEl
				.play()
				.then(() => {
					this.hasPlayed = true
				})
				.catch((e) => console.log('error playing video', e))
		}
	}
	async pause() {
		if (!this.videoEl.paused && this.hasPlayed) {
			console.log('pause called')
			await this.videoEl.pause()
		}
	}
}
