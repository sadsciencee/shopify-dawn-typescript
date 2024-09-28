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
	eventDriven: boolean
	eventEnabled: boolean

	constructor() {
		super()
		this.videoEl = q.rs<HTMLVideoElement>('video', this)
		this.hlsSource = this.videoEl.getAttribute('data-hls-src') ?? undefined
		this.hlsReady = false
		;(this.mp4Source =
			this.videoEl.getAttribute('data-mp4-src') ?? undefined),
			(this.usingMp4Source = false)
		this.initialized = true
		this.eventDriven = this.hasAttribute('data-event-driven')
		this.eventEnabled = false
	}

	override async connectedCallback() {
		super.connectedCallback()
		if (window?.Ucoast?.mediaManager?.hlsLibraryLoaded) {
			void this.onLibraryLoad()
		}
	}

	override async disconnectedCallback() {
		super.disconnectedCallback()
		if (this.hlsInstance) {
			this.hlsInstance.destroy()
			window.Ucoast.mediaManager.videos =
				window.Ucoast.mediaManager.videos.filter(
					(video) => video !== this
				)
		}
	}

	async playEventOn() {
		if (!this.eventDriven) return
		this.eventEnabled = true
		await this.play()
	}

	playEventOff() {
		if (!this.eventDriven) return
		this.eventEnabled = false
		this.pause()
	}

	async play() {
		// all conditions that should prevent the video from playing must go here
		if (this.eventDriven && !this.eventEnabled) return
		if (this.isHiddenForViewport()) return
		if (isVideoPlaying(this.videoEl)) return
		if (this.isWaitingForHlsLibrary()) return
		if (percentageSeen(this.videoEl) <= 0) return

		// check for updates that must happen before playing that can be done synchronously
		if (!this.hlsSource && !this.usingMp4Source && this.mp4Source) {
			this.videoEl.src = this.mp4Source
			this.usingMp4Source = true
		}
		// play video w/native html5 video element
		console.log('playing')
		await this.videoEl.play()
		this.setAttribute('data-uc-has-played', 'true')
	}
	pause() {
		if (isVideoPlaying(this.videoEl)) {
			console.log('pausin')
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
		// don't run if this isn't an hls video or if hls is already initalized for this element
		if (!this.hlsSource) return
		if (this.hlsInstance) return
		// initialize hls - this is a 3ms process that doesn't load any video data until a video is played
		this.hlsInstance = new window.Ucoast.mediaManager.Hls.default()
		this.hlsInstance.on('hlsManifestParsed', () => {
			this.hlsReady = true
			void this.play()
		})
		this.videoEl.src = this.hlsSource
		await this.hlsInstance.loadSource(this.hlsSource)
		await this.hlsInstance.attachMedia(this.videoEl)
		// all videos present in DOM at page load are added to the mediaManager.videos array, but if this video was added to the DOM later, it needs to be added to the array
		if (
			!Array.from(window.Ucoast.mediaManager.videos).some(
				(video) => video === this
			)
		) {
			window.Ucoast.mediaManager.videos.push(this)
		}
	}

	isHiddenForViewport() {
		return (
			this.videoEl.getBoundingClientRect().height < 1 ||
			this.videoEl.getBoundingClientRect().width < 1
		)
	}
}
