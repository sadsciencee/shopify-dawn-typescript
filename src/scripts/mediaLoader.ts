import { isInViewport, qsaOptional } from '@/scripts/functions'
import { UcoastVideo } from '@/scripts/media/ucoast-video'
export const mediaLoader = () => {
	const images = qsaOptional('img')
	const videos = qsaOptional<UcoastVideo>('ucoast-video')

	if (images) {
		images.forEach((image) => {
			if (!(image instanceof HTMLImageElement) || !isInViewport(image)) return
			replaceSrcSet(image)
		})
		const imageObserver = new IntersectionObserver(onImageIntersection, {
			rootMargin: '100% 0% 100% 0%',
		})
		images.forEach((element) => imageObserver.observe(element))
	}

	if (videos) {
		const videoObserver = new IntersectionObserver(onVideoIntersection, {
			threshold: 0.1,
		})
		videos.forEach((element) => videoObserver.observe(element))
		const videoPreloadObserver = new IntersectionObserver(onVideoPreloadIntersection, {
			rootMargin: '100% 0% 100% 0%',
		})
		videos.forEach((element) => videoPreloadObserver.observe(element))
	}
}

function onImageIntersection(elements: IntersectionObserverEntry[], _: IntersectionObserver) {
	elements.forEach((element) => {
		if (element.isIntersecting) {
			const image = element.target
			if (!(image instanceof HTMLImageElement)) throw 'element target not found'
			replaceSrcSet(image)
		}
	})
}

function onVideoIntersection(elements: IntersectionObserverEntry[], _: IntersectionObserver) {
	elements.forEach((element) => {
		const video = element.target
		if (!(video instanceof UcoastVideo)) return

		if (element.isIntersecting) {
			console.log('isIntersecting - play')
			void video.play()
		} else {
			console.log('is not intersecting - pause')
			void video.pause()
		}
	})
}

function onVideoPreloadIntersection(
	elements: IntersectionObserverEntry[],
	_: IntersectionObserver
) {
	elements.forEach((element) => {
		const video = element.target
		if (!(video instanceof UcoastVideo)) return

		if (element.isIntersecting) {
			void video.preload()
		}
	})
}

export const replaceSrcSet = (
	image: HTMLImageElement,
	options?: { overrideTargetSize?: Number; loadImmediately?: boolean }
) => {
	const srcSet = image.getAttribute('data-srcset')
	if (!srcSet) return
	const devicePixelRatio = window.devicePixelRatio ?? 2
	const targetSize =
		options?.overrideTargetSize ??
		(image.getBoundingClientRect().width * devicePixelRatio).toFixed(0)
	let newSrc = image.getAttribute('src')
	if (!newSrc || !newSrc.includes('&width=')) return
	const srcArr = newSrc.split('&width=')
	newSrc = `${srcArr[0]}&width=${targetSize}`

	const defer = image.hasAttribute('data-uc-defer')
	if (defer) {
		image.setAttribute('data-src', newSrc)
	} else if (options?.loadImmediately) {
		image.removeAttribute('loading')
		let preloadedImage = new Image()
		preloadedImage.src = newSrc
		image.setAttribute('src', newSrc)
	} else {
		image.setAttribute('loading', 'eager')
		image.setAttribute('src', newSrc)
	}
}
