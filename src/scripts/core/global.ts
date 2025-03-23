import { UcoastVideo } from '@/scripts/core/ucoast-video'
import { type ProductModel } from '@/scripts/optional/product-model'
import { MediaManager } from '@/scripts/core/media'
import { type ProductVariant } from '@/scripts/shopify'
import { type HeaderMenu } from '@/scripts/theme/header-menu'
import { WaitlistForm } from '@/scripts/theme/waitlist-form'
import { ModalDialog } from '@/scripts/theme/modal-dialog'
import { TsDOM as q, init } from '@/scripts/core/TsDOM'
import { ArtDirection } from '@/scripts/core/art-direction'
// CONSTANTS
export const ON_CHANGE_DEBOUNCE_TIMER = 300

export const PUB_SUB_EVENTS = {
	cartUpdate: 'cart-update',
	quantityUpdate: 'quantity-update',
	variantChange: 'variant-change',
	cartError: 'cart-error',
}

//  common attributes. sometimes these are used as elements selectors, if the attribute is added/removed
export const ATTRIBUTES = {
	cartEmpty: 'data-uc-cart-empty',
	loading: 'data-uc-loading',
	submenu: 'data-uc-submenu',
	menuOpening: 'data-uc-menu-opening'
}

// selectors for common elements where the selector won't be added/removed
export const SELECTORS = {
	cartLink: '[data-uc-cart-icon-bubble]',
	loadingOverlay: '[data-uc-loading-overlay]',
	loadingOverlaySpinner: '[data-uc-loading-overlay-spinner]',
	sectionHeader: '.section-header',
	headerWrapper: '[data-uc-header-wrapper]',
}

// change these if the designer uses the wrong viewport size
// you will also need to modify the functions css accordingly
export const MOBILE_VIEWPORT_ANCHOR = 375
export const DESKTOP_VIEWPORT_ANCHOR = 1440

// PUB SUB
// todo: add additional data types as needed

export type CartUpdateEvent = {
	source: 'cart-items' | 'product-form'
	productVariantId?: number
}

export type CartErrorEvent = {
	source: 'product-form'
	productVariantId: number
	errors: string | string[] | { [key: string]: string[] }
	message: string
}

export type VariantChangeEvent = {
	source: 'product-form'
	data: {
		sectionId: string
		html: Document
		variant: ProductVariant
	}
}

export type PubSubEvent = CartUpdateEvent | CartErrorEvent | VariantChangeEvent | undefined

// typeguards for events

export function isCartUpdateEvent(obj: PubSubEvent): obj is CartUpdateEvent {
	if (!obj) return false
	if (!('source' in obj)) return false
	if (!('productVariantId' in obj)) return false
	return true
}

export function isCartErrorEvent(obj: PubSubEvent): obj is CartErrorEvent {
	if (!obj) return false
	if (!('source' in obj)) return false
	if (!('productVariantId' in obj)) return false
	if (!('message' in obj)) return false
	if (!('errors' in obj)) return false
	return true
}

export function createVariantChangeEvent(event:VariantChangeEvent) {
	if (!isVariantChangeEvent(event)) {
		throw new Error('Event is not a VariantChangeEvent')
	}
	return event
}

export function isVariantChangeEvent(obj: PubSubEvent): obj is VariantChangeEvent {
	if (!obj) return false
	if (!('data' in obj)) return false
	if (!('sectionId' in obj.data)) return false
	if (!('html' in obj.data)) return false
	if (!('variant' in obj.data)) return false
	return true
}

export type SubscriberCallback = (pubSubEvent: PubSubEvent) => void

let subscribers: Record<string, SubscriberCallback[]> = {}

export function subscribe(eventName: string, callback: SubscriberCallback) {
	if (subscribers[eventName] === undefined) {
		subscribers[eventName] = []
	}

	subscribers[eventName] = [...subscribers[eventName], callback]

	return function unsubscribe() {
		subscribers[eventName] = subscribers[eventName].filter((cb) => {
			return cb !== callback
		})
	}
}

export function publish(eventName: string, pubSubEvent: PubSubEvent = undefined) {
	if (subscribers[eventName]) {
		subscribers[eventName].forEach((callback) => {
			callback(pubSubEvent)
		})
	}
}

// browser safe replace all
export const replaceAll = (str: string, find: string, replace: string) => {
	return str.split(find).join(replace)
}

// scroll to anchor link with some ucoast-specific features, not used in default dawn repack
export const scrollToAnchor = (selector: string) => {
	const header = q.rs('[data-uc-header-wrapper]')
	const anchor = q.rs(selector)
	const headerHeight = header.offsetHeight
	const collectionTop = anchor.getBoundingClientRect().top
	const scrollToPosition =
		collectionTop -
		headerHeight -
		parseFloat(window?.getComputedStyle(anchor)?.getPropertyValue('margin-top') ?? 0) +
		1
	window.scrollBy({ top: scrollToPosition, behavior: 'smooth' })
}

// if you are using a custom app and need to change the backend route, you can do it here
// note that if using klaviyo, you can use the client api which is auth'd by shopify and doesnt require a separate backend to secure
export const getBackendRoute = () => {
	return 'http://localhost:5000'
}

export const getCurrentHeaderHeight = () => {
	let height = 0
	const headerSections = q.rl('.shopify-section-group-header-group')
	headerSections.forEach((section) => {
		const sectionHeight = section.getBoundingClientRect().height
		height += sectionHeight
	})
	return height
}

// this function applies the scaling from the --ax variables. it is project-dependent
// 1440 and 375 are specific to the size I request from designers, however should be refactored as Constants
// TODO: add const defs for hard coded scaling values

export const scaleValue = (val: number, viewport: 'mobile' | 'desktop') => {
	let ratio = viewport === 'desktop' ? DESKTOP_VIEWPORT_ANCHOR / window.innerWidth : MOBILE_VIEWPORT_ANCHOR / window.innerWidth
	if (viewport === 'desktop' && ratio > 1.25) ratio = 1.25 // this is a reverse of the 1:.8 ratio from desktop min in css
	if (viewport === 'desktop' && ratio < 1) ratio = 1 // this is a verse of the 1:1.15 ratio from desktop max in css
	if (viewport === 'mobile' && ratio > 1.1111111111) ratio = 1.1111111111
	if (viewport === 'mobile' && ratio < 1) ratio = 1
	return (val * ratio).toFixed(1)
}

// this sets all relevant height variables
// i dont really love doing this because it causes cls...
// normally i will measure the header at 1440px and 375px and then set the vars manually in the css variables liquid file
// if the client insists on having two lines in the announcement bar (which they should not be doing) then you might need to use this
export const setHeightVars = (header: HTMLElement, announcement: HTMLElement | undefined) => {
	const viewport = window.innerWidth >= 750 ? 'desktop' : 'mobile'
	const viewportHeight =
		viewport === 'desktop'
			? '100vh'
			: `calc(${scaleValue(window.innerHeight, viewport)} * var(--ax))`
	document.documentElement.style.setProperty('--viewport-height', viewportHeight)
	document.documentElement.style.setProperty(
		'--header-height',
		`calc(${scaleValue(header.getBoundingClientRect().height, viewport)} * var(--ax))`
	)

	if (announcement) {
		document.documentElement.style.setProperty(
			'--announcement-height',
			`calc(${scaleValue(announcement.getBoundingClientRect().height, viewport)} * var(--ax))`
		)
	}
}

// set drawer height when opened - this prevents the drawer from being too short on mobile
// tbh, shouldn't be necessary with proper height vars, but keeping it here since shopify uses it
export const setDrawerHeight = () => {
	document.documentElement.style.setProperty('--drawer-height', `${window.innerHeight}px`)
}

// accessibility functions
export function initializeSummaryA11y() {
	// this is from shopify
	// it adds some accessibility features to summary elements
	document.querySelectorAll('[id^="Details-"] summary:not([data-summary-hover])').forEach((summary) => {
		summary.setAttribute('role', 'button')
		const parentNode =
			summary.parentNode instanceof HTMLElement ? summary.parentNode : undefined
		const ariaExpandedVal = parentNode && parentNode.hasAttribute('open') ? 'true' : 'false'
		summary.setAttribute('aria-expanded', ariaExpandedVal)

		const nextElementSibling =
			summary.nextElementSibling instanceof HTMLElement
				? summary.nextElementSibling
				: undefined

		if (nextElementSibling && nextElementSibling.hasAttribute('id')) {
			summary.setAttribute('aria-controls', q.ra(nextElementSibling, 'id'))
		}
		summary.addEventListener('click', (event) => {
			//event.preventDefault()
			const currentTarget = q.rct(event)
			const closestTarget = q.rClosestTarget(event, 'details')
			const shouldOpen = !closestTarget.hasAttribute('open')
			currentTarget.setAttribute('aria-expanded', `${shouldOpen}`)
		})
		if (summary.closest('header-drawer, menu-drawer')) return

		const parentElement =
			summary.parentElement instanceof HTMLElement ? summary.parentElement : undefined
		if (!parentElement) return
		parentElement.addEventListener('keyup', q.onKeyUpEscape)
	})

	document.querySelectorAll('[data-summary-hover="off"]').forEach((el) => {
		el.addEventListener('mouseenter', (_) => {
			closeAllHeaderMenus()
		})
	})

	const closeOnExitContainers = q.ol('[data-close-menus-on-mouse-exit]')
	closeOnExitContainers?.forEach(el => {
		el.addEventListener('mouseleave', (_) => {
			closeAllHeaderMenus()
		})
	})
}

function closeAllHeaderMenus() {
	console.log('close all', window.Ucoast.openMenuId)
	if (!window.Ucoast.openMenuId) return
	const headerMenus = q.ol<HeaderMenu>('header-menu')
	headerMenus?.forEach(el => el.close())
	window.Ucoast.openMenuId = undefined
}



export function focusVisiblePolyfill() {
	const navKeys = [
		'ARROWUP',
		'ARROWDOWN',
		'ARROWLEFT',
		'ARROWRIGHT',
		'TAB',
		'ENTER',
		'SPACE',
		'ESCAPE',
		'HOME',
		'END',
		'PAGEUP',
		'PAGEDOWN',
	]
	let currentFocusedElement: HTMLElement | Element | null = null
	let mouseClick: boolean | null = null

	window.addEventListener('keydown', (event) => {
		if (navKeys.includes(event.code?.toUpperCase())) {
			mouseClick = false
		}
	})

	window.addEventListener('mousedown', (_event: MouseEvent) => {
		mouseClick = true
	})

	window.addEventListener(
		'focus',
		() => {
			if (currentFocusedElement) currentFocusedElement.classList.remove('focused')

			if (mouseClick) return

			currentFocusedElement = document.activeElement
			if (currentFocusedElement instanceof HTMLElement) {
				currentFocusedElement.classList.add('focused')
			}
		},
		true
	)
}

export function pauseAllMedia() {
	const jsYoutubeEls = q.ol<HTMLIFrameElement>('.js-youtube')
	if (jsYoutubeEls) {
		jsYoutubeEls.forEach((video) => {
			if (!video.contentWindow) return
			video.contentWindow.postMessage(
				'{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
				'*'
			)
		})
	}

	const jsVimeoEls = q.ol<HTMLIFrameElement>('.js-vimeo')
	if (jsVimeoEls) {
		jsVimeoEls.forEach((video) => {
			if (!video.contentWindow) return
			video.contentWindow.postMessage('{"method":"pause"}', '*')
		})
	}

	const html5Videos = q.ol<HTMLVideoElement>('video')
	if (html5Videos) {
		html5Videos.forEach((video) => video.pause())
	}

	const productModels = q.ol<ProductModel>('product-model')
	if (productModels) {
		productModels.forEach((model) => {
			if (model.modelViewerUI) model.modelViewerUI.pause()
		})
	}
}

// fetch API configs

export function fetchConfig(type = 'json') {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
	}
}

export function formatPhoneNumber(unchecked_number: string) {
	let phone_number = unchecked_number
		.replace('(', '')
		.replace(')', '')
		.replace('+', '')
		.replaceAll('-', '')
		.replaceAll(' ','')
		.trim()
	if (window?.Shopify?.country === 'US' && phone_number.length === 10) {
		phone_number = `+1${phone_number}`
	}
	return phone_number
}

// this isnt enabled by default but it comes up. uses browser cookies to track recently viewed products
export function getRecentlyViewedProducts(): string[] {
	const pageList = localStorage.getItem('pageList')
	if (!pageList) return []
	return JSON.parse(pageList) || []
}

export function trackRecentlyViewedProducts() {
	const pageList = getRecentlyViewedProducts()

	let currentUrl = window.location.href.split('?')[0]

	if (!pageList.includes(currentUrl) && currentUrl.includes('/products/')) {
		pageList.push(currentUrl)

		if (pageList.length > 4) {
			pageList.shift()
		}

		localStorage.setItem('pageList', JSON.stringify(pageList))
	}
}

// used in critical.js
export function disableDesktopCSS() {
	if (window.innerWidth >= 990) return
	const mUp = q.ol('link[href*=".m-up"]')
	mUp?.forEach((link) => {
		const href = link.getAttribute('href')
		if (!href || href.includes('::')) return // vite urls contain ::
		link.removeAttribute('href')
		link.setAttribute('data-href', href)
	})
	if (window.innerWidth < 750) {
		const sUp = q.ol('link[href*=".s-up"]')
		sUp?.forEach((link) => {
			const href = link.getAttribute('href')
			if (!href || href.includes('::')) return
			link.removeAttribute('href')
			link.setAttribute('data-href', href)
		})
		return
	}
}

export function openWaitlistModal(variantId: number, opener: HTMLElement) {
	const modal = q.rs<ModalDialog>(`#WaitlistModal`)
	const waitlistForm = q.rs<WaitlistForm>('waitlist-form', modal)
	waitlistForm.variantInput.value = `${variantId}`
	if (modal) modal.show(opener)
}
export function initializeShopifyConsentAPI() {
	window.Shopify?.loadFeatures(
		[
			{
				name: 'consent-tracking-api',
				version: '0.1',
			},
		],
		(error) => {
			if (error) {
				console.error('error initializing privacy api')
				console.log('error', error)
			} else {
				window.Ucoast.shopifyConsentAPILoaded = true
			}
		}
	)
}


function initGlobalUcoast() {
	q.safeDefineElement(ArtDirection)
	q.safeDefineElement(UcoastVideo)
	const iOS = window.Ucoast?.iOS ?? false
	const Ucoast: typeof window.Ucoast = {
		shopifyConsentAPILoaded: false,
		iOS,
		mediaManager: new MediaManager()
	}
	if (!window.Ucoast) {
		window.Ucoast = Ucoast
	}
	if (!window.Ucoast.mediaManager) {
		window.Ucoast.mediaManager = new MediaManager()
	}

}


// this is critical js, it runs at the top level of the app. none critical code should generally be in a web component and loaded in a deferred module
export function globalSetup() {
	init()
	initGlobalUcoast()
	initializeShopifyConsentAPI()
	q.safeDefineElement(UcoastVideo)
	initializeSummaryA11y()
	try {
		document.querySelector(':focus-visible')
	} catch (e) {
		focusVisiblePolyfill()
	}
	// mediaLoader
	void window.Ucoast.mediaManager.initialLoad()
}
