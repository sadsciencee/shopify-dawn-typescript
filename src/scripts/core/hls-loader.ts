import { UcoastEl } from '@/scripts/core/UcoastEl'
import { qsaOptional, qsaRequired } from '@/scripts/functions'
import { uCoastWindow } from '@/scripts/setup'
import { UcoastVideo } from '@/scripts/core/ucoast-video'
declare let window: uCoastWindow
export class HlsLoader extends UcoastEl {
	static htmlSelector = 'hls-loader'
	hlsScripts: NodeListOf<HTMLScriptElement>
	videos?: NodeListOf<HTMLVideoElement>
	loading: boolean
	loaded: boolean
	constructor() {
		super()
		this.hlsScripts = qsaRequired('script', this)
		this.videos = qsaOptional('ucoast-video')
		this.loading = false
		this.loaded = false
	}
	override connectedCallback() {
		super.connectedCallback()
		if (!this.videos) return
		const video = this.videos[0]
		if (!(video instanceof UcoastVideo)) return

		if (
			!video.videoEl.canPlayType('application/vnd.apple.mpegurl') &&
			video.hasHls &&
			!video.hlsReady &&
			video.hlsSource
		) {
			void this.loadHlsScript()
		}
	}
	async loadHlsScript() {
		if (window.loadHls) {
			window.loadHls()
		} else {
			this.loading = true
			this.hlsScripts.forEach((scriptEl) => {
				const src = scriptEl.getAttribute('data-src')
				if (!src) throw 'hls script not found'
				scriptEl.setAttribute('src', src)
			})
		}
	}
}
