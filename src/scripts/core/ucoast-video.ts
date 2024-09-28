import { UcoastEl } from '@/scripts/core/UcoastEl'
import { type Hls } from '@/scripts/global'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { percentageSeen } from '@/scripts/theme/animations'

function isVideoPlaying(video: HTMLVideoElement): boolean {
	return !video.paused && !video.ended && video.currentTime > 0
}

export class UcoastVideo extends UcoastEl {
	static htmlSelector = 'ucoast-video'
	videoEl: HTMLVideoElement
	hlsReady: boolean
	hlsSource?: string
	mp4Source?: string
	initialized = false
	usingMp4Source: boolean
	hlsInstance: Hls

	constructor() {
		super()
		this.videoEl = q.rs<HTMLVideoElement>('video', this)
		this.hlsSource = this.videoEl.getAttribute('data-hls-src') ?? undefined
		this.hlsReady = false
		this.mp4Source = this.videoEl.getAttribute('data-mp4-src') ?? undefined,
		this.usingMp4Source = false
		this.initialized = true
	}

	override async connectedCallback() {
		super.connectedCallback()
		if (window?.Ucoast?.mediaManager?.hlsLibraryLoaded) {
			void this.onLibraryLoad()
			// todo - add element to mediaManager.videos
		}
	}

	override async disconnectedCallback() {
		super.disconnectedCallback()
		if (this.hlsInstance) {
			this.hlsInstance.destroy()
			// todo - remove element from mediaManager.videos
		}
	}

	// todo playEventOn()
	// todo playEventOff()

	async play() {
		if (this.isHiddenForViewport()) return
		if (isVideoPlaying(this.videoEl)) return
		if (this.isWaitingForHlsLibrary()) return
		if (percentageSeen(this.videoEl) <= 0) return
		// todo: skip if video has 'on-event' attribute

		if (!this.hlsSource && !this.usingMp4Source && this.mp4Source) {
			this.videoEl.src = this.mp4Source
			this.usingMp4Source = true
		}
		await this.videoEl.play()
		this.setAttribute('data-uc-has-played', 'true')
	}
	pause() {
		if (isVideoPlaying(this.videoEl)) {
			this.videoEl.pause()
		}
	}

	isWaitingForHlsLibrary() {
		if (!this.hlsSource) return false
		if (!window.Ucoast.mediaManager.hlsRequired) return false
		if (!this.hlsReady) return true
		return !window.Ucoast.mediaManager.hlsLibraryLoaded
	}

	async onLibraryLoad() {
		if (!this.hlsSource) return
		if (this.hlsInstance) return
		this.hlsInstance = new window.Ucoast.mediaManager.Hls.default()
		//this.hlsInstance.on('hlsMediaAttached', async (a, b) => {})
		this.hlsInstance.on('hlsManifestParsed', (event, data) => {
			this.hlsReady = true
			void this.play()
		})
		this.videoEl.src = this.hlsSource
		await this.hlsInstance.loadSource(this.hlsSource)
		await this.hlsInstance.attachMedia(this.videoEl)
	}

	isHiddenForViewport() {
		return (
			this.videoEl.getBoundingClientRect().height < 1 ||
			this.videoEl.getBoundingClientRect().width < 1
		)
	}
}
