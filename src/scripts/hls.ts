// @ts-ignore
import Hls from 'hls.js/dist/hls.light.min.js'
import { qsaOptional, qsRequired, safeDefineElement } from '@/scripts/functions'
import { UcoastVideo } from '@/scripts/core/ucoast-video'
import { type HlsLoader } from '@/scripts/core/hls-loader'

export const loadHls = async () => {
	const hlsLoader = qsRequired<HlsLoader>('hls-loader')
	hlsLoader.loaded = true
	if (UcoastVideo === undefined) {
		safeDefineElement(UcoastVideo)
	}
	const videos = qsaOptional('ucoast-video')
	if (!videos) return
	for (let i = 0; i < videos.length; i++) {
		const video = videos[i]
		if (!(video instanceof UcoastVideo)) {
			throw 'not initialized'
		}
		if (!video.initialized) video.init()
		if (
			video.hasHls &&
			Hls.isSupported() &&
			video.hlsSource &&
			!video.hlsReady &&
			video.videoEl.paused
		) {
			const hls = new Hls()
			hls.loadSource(video.hlsSource)
			hls.attachMedia(video.videoEl)
			hls.on(Hls.Events.MANIFEST_PARSED, async function () {
				video.hlsReady = true
				await video.playIfInView()
			})
		} else {
			console.log('did not init hls', {
				hasHls: video.hasHls,
				'Hls.isSupported()': Hls.isSupported(),
				hlsSource: video.hlsSource,
				hlsReady: video.hlsReady,
				pause: video.videoEl.paused,
			})
		}
	}
}
