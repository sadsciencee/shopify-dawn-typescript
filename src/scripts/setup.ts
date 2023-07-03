import {
	getOrThrow,
	getOrUndefined,
	onKeyUpEscape, qsaOptional,
	qsRequired,
	setDrawerHeight,
	targetRequired
} from '@/scripts/functions';
import { initializeScrollAnimationTrigger } from '@/scripts/animations'
import { enableZoomOnHover } from '@/scripts/media/magnify'
import { mediaLoader } from '@/scripts/mediaLoader'
import { CountryProvinceSelector } from './shopify';

export interface VariantChangeEvent extends Event {
	data: {
		sectionId: string
		html: Document
		currentVariant: JSON
	}
}

type PaymentButtonReference = {
	init: () => void
} & typeof HTMLElement

export interface ModelViewerUIConstructor {
	new (modelViewEl: HTMLElement): ModelViewerUIReference
}

export type ModelViewerUIReference = {
	pause: () => void
	constructor: ModelViewerUIConstructor
} & typeof HTMLElement

export class uCoastShopify {
	shop?: string
	locale?: string
	currency?: {
		active: string
		rate: string
	}
	country?: string
	theme?: {
		name: string
		id: number
		theme_store_id: number
		role: string
		handle: string
		style: {
			id: string
			handle: string
		}
	}
	cdnHost?: string
	routes?: {
		root: string
	}
	analytics?: {
		replayQueue: any[]
	}
	modules?: boolean
	recaptchaV3?: {
		siteKey: string
	}
	CountryProvinceSelector: typeof CountryProvinceSelector
	PaymentButton?: PaymentButtonReference
	ModelViewerUI?: ModelViewerUIReference
	designMode: boolean
	loadFeatures?: (
		array: { name: string; version: string }[],
		callback: (error: Error | Error[]) => void
	) => void
	customerPrivacy?: {
		shouldShowGDPRBanner: () => boolean
		shouldShowCCPABanner: () => boolean
		userCanBeTracked: () => boolean
		getTrackingConsent: () => string
		setTrackingConsent: (consent: boolean, callback: (error?: string) => void) => void
		preferencesProcessingAllowed: () => boolean
		thirdPartyMarketingAllowed: () => boolean
		analyticsProcessingAllowed: () => boolean
		currentVisitorConsent: () => string
		userDataCanBeSold: () => boolean
	}

	constructor(config: Partial<uCoastShopify>) {
		this.shop = config.shop
		this.locale = config.locale
		this.currency = config.currency
		this.country = config.country
		this.theme = config.theme
		this.cdnHost = config.cdnHost
		this.routes = config.routes
		this.analytics = config.analytics
		this.modules = config.modules
		this.PaymentButton = config.PaymentButton
		this.recaptchaV3 = config.recaptchaV3
		this.designMode = config.designMode ?? false
		this.CountryProvinceSelector = CountryProvinceSelector
	}

	public bind(fn: Function, scope: CountryProvinceSelector) {
		return function () {
			return fn.apply(scope, arguments)
		}
	}

	public setSelectorByValue(selector: HTMLSelectElement, value: string) {
		for (let i = 0, count = selector.options.length; i < count; i++) {
			let option = selector.options[i]
			if (value == option.value || value == option.innerHTML) {
				selector.selectedIndex = i
				return i
			}
		}
	}

	public addListener = function (
		target: HTMLElement,
		eventName: string,
		callback: (event: Event) => void
	) {
		if (!(target instanceof HTMLElement)) return
		if (target.addEventListener) {
			target.addEventListener(eventName, callback, false)
		} else if ((target as any).attachEvent) {
			;(target as any).attachEvent('on' + eventName, callback)
		}
	}

	public postLink(path: string, options: { parameters: { _method?: string } }) {
		if (!options || !options.parameters || !options.parameters._method) return
		options = options || {}
		let method = options['parameters']['_method'] || 'post'
		let form = document.createElement('form')
		form.setAttribute('method', method)
		form.setAttribute('action', path)
		let hiddenField = document.createElement('input')
		hiddenField.setAttribute('type', 'hidden')
		hiddenField.setAttribute('name', '_method')
		hiddenField.setAttribute('value', method)
		form.appendChild(hiddenField)

		document.body.appendChild(form)
		form.submit()
		document.body.removeChild(form)
	}
}

type routesType = {
	cart_add_url: string
	cart_change_url: string
	cart_update_url: string
	cart_url: string
	predictive_search_url: string
	root: string
}

type cartStringsType = {
	error: string
	quantityError: string
}

type variantStringsType = {
	addToCart: string
	soldOut: string
	unavailable: string
	unavailable_with_option: string
	preorder: string
	comingSoon: string
}

type accessibilityStringsType = {
	imageAvailable: string
	shareSuccess: string
	pauseSlideshow: string
	playSlideshow: string
}

export interface uCoastWindow extends Window {
	routes: routesType
	Shopify: uCoastShopify
	klaviyoPopupWaitingForConsent?: boolean
	demoMode?: boolean
	cartStrings: cartStringsType
	shopUrl: string
	variantStrings: variantStringsType
	accessibilityStrings: accessibilityStringsType
	ShopifyXR?: {
		setupXRElements: () => void
		addModels: (json: any) => void
	}
	loadHls?: () => void
}

declare let window: uCoastWindow

export const routes: routesType =
	window && window?.routes
		? window.routes
		: {
				cart_add_url: '/cart/add',
				cart_change_url: '/cart/change',
				cart_update_url: '/cart/update',
				cart_url: '/cart',
				predictive_search_url: '/search/suggest',
				root: '/',
		  }

export const cartStrings: cartStringsType =
	window && window?.cartStrings
		? window.cartStrings
		: {
				error: '',
				quantityError: '',
		  }

export const shopUrl = window && window?.shopUrl ? window.shopUrl : '/'

export const variantStrings: variantStringsType =
	window && window?.variantStrings
		? window.variantStrings
		: {
				addToCart: '',
				soldOut: '',
				preorder: '',
				comingSoon: '',
				unavailable: '',
				unavailable_with_option: '',
		  }

export const accessibilityStrings: accessibilityStringsType = {
	imageAvailable: '',
	shareSuccess: '',
	pauseSlideshow: '',
	playSlideshow: '',
}

export function globalSetup() {
	trackRecentlyViewedProducts()
	enableZoomOnHover(2)
	// a11y focus
	document.querySelectorAll('[id^="Details-"] summary').forEach((summary: Element) => {
		summary.setAttribute('role', 'button')
		if (summary.parentNode instanceof HTMLElement) {
			summary.setAttribute(
				'aria-expanded',
				summary.parentNode.hasAttribute('open') ? 'true' : 'false'
			)
		}

		if (
			summary.nextElementSibling instanceof HTMLElement &&
			summary.nextElementSibling.getAttribute('id')
		) {
			summary.setAttribute('aria-controls', summary.nextElementSibling.id)
		}

		summary.addEventListener('click', (event) => {
			setDrawerHeight()
			if (!(event.currentTarget instanceof HTMLElement)) return
			const detailsEl = event.currentTarget.closest('details')
			if (!(detailsEl instanceof HTMLElement)) return
			event.currentTarget.setAttribute(
				'aria-expanded',
				!detailsEl.hasAttribute('open') ? 'false' : 'true'
			)
		})

		if (summary.closest('header-drawer') || !(summary.parentElement instanceof Element)) return
		summary.parentElement.addEventListener('keyup', onKeyUpEscape)
	})

	// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
	try {
		document.querySelector(':focus-visible')
	} catch (e) {
		focusVisiblePolyfill()
	}
	mediaLoader()
}

export function initShopify() {
	return new uCoastShopify(window && window?.Shopify ? window.Shopify : { designMode: false })
}

// pub sub
type Callback<T> = (data: T) => void

interface Subscribers {
	[eventName: string]: Array<Callback<any>>
}

let subscribers: Subscribers = {}

export function subscribe<T extends Event = Event>(
	eventName: string,
	callback: Callback<T>
): () => void {
	if (subscribers[eventName] === undefined) {
		subscribers[eventName] = []
	}

	subscribers[eventName] = [...subscribers[eventName], callback]

	return function unsubscribe() {
		subscribers[eventName] = subscribers[eventName].filter((cb: Callback<T>) => {
			return cb !== callback
		})
	}
}

export function publish<T>(eventName: string, data: T): void {
	if (subscribers[eventName]) {
		subscribers[eventName].forEach((callback: Callback<T>) => {
			callback(data)
		})
	}
}

// generic helpers
export const debounce = (fn: Function, ms = 300) => {
	let timeoutId: ReturnType<typeof setTimeout>
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn.apply(this, args), ms)
	}
}

export function fetchConfig(type = 'json') {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
	}
}

type AddToCartFormValues = {
	quantity: number
	form_type: string
	id: number
	sections?: string
	sections_url?: string
}

export function addToCartConfig(body: FormData) {
	const data: AddToCartFormValues = {
		quantity: getOrUndefined(body, 'quantity') ?? 1,
		form_type: getOrThrow(body, 'form_type'),
		id: getOrThrow(body, 'id'),
		sections: getOrUndefined(body, 'sections'),
		sections_url: getOrUndefined(body, 'sections_url'),
	}
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: `application/javascript`,
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify(data),
	}
}

type AddToKlaviyoListFormValues = {
	email: string
	list_id: string
	phone_number?: string
}

export function addToKlaviyoListConfig(body: FormData) {
	const data: AddToKlaviyoListFormValues = {
		email: getOrThrow(body, 'email'),
		list_id: getOrThrow(body, 'list_id'),
		phone_number: getOrUndefined(body, 'phone_number'),
	}
	return {
		method: 'POST',
		mode: 'cors' as RequestMode,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	}
}

type NotifyMeConfigValues = {
	email: string
	variant: string
}

export function notifyMeConfig(body: FormData) {
	const data: NotifyMeConfigValues = {
		email: getOrThrow(body, 'email'),
		variant: getOrThrow(body, 'variant'),
	}
	return {
		method: 'POST',
		mode: 'cors' as RequestMode,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	}
}

// a11y functions

export function getFocusableElements(container: HTMLElement) {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	)
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
	let currentFocusedElement: Element | null = null
	let mouseClick: boolean | null = null

	window.addEventListener('keydown', (event) => {
		if (navKeys.includes(event.code.toUpperCase())) {
			mouseClick = false
		}
	})

	window.addEventListener('mousedown', () => {
		mouseClick = true
	})

	window.addEventListener(
		'focus',
		() => {
			if (currentFocusedElement) currentFocusedElement.classList.remove('focused')

			if (mouseClick) return

			currentFocusedElement = document.activeElement ?? null
			if (!currentFocusedElement) {
				console.error('No focused element')
				return
			}
			currentFocusedElement.classList.add('focused')
		},
		true
	)
}

export function pauseAllMedia() {
	const jsYoutubeEls = qsaOptional<HTMLIFrameElement>('.js-youtube')
	if (jsYoutubeEls) {
		jsYoutubeEls.forEach((video) => {
			if (!video.contentWindow) return;
			video.contentWindow.postMessage(
				'{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
				'*'
			)
		})
	}

	const jsVimeoEls = qsaOptional<HTMLIFrameElement>('.js-vimeo')
	if (jsVimeoEls) {
		jsVimeoEls.forEach((video) => {
			if (!video.contentWindow) return;
			video.contentWindow.postMessage('{"method":"pause"}', '*')
		})
	}

	const html5Videos = qsaOptional<HTMLVideoElement>('video')
	if (html5Videos) {
		html5Videos.forEach((video) => video.pause())
	}

	const productModels = qsaOptional<ProductModel>('product-model')
	if (productModels) {
		productModels.forEach((model) => {
			if (model.modelViewerUI) model.modelViewerUI.pause()
		})
	}
}

const trapFocusHandlers: {
	focusin?: (event: Event) => void
	focusout?: (event: Event) => void
	keydown?: (event: KeyboardEvent) => void
} = {}

export function trapFocus(container: HTMLElement, elementToFocus: HTMLElement = container) {
	let elements = getFocusableElements(container)
	let first = elements[0] as HTMLElement
	let last = elements[elements.length - 1] as HTMLElement

	removeTrapFocus()

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault()
			first.focus()
		}

		//  On the first focusable element and tab backward, focus the last element.
		if ((event.target === container || event.target === first) && event.shiftKey) {
			event.preventDefault()
			last.focus()
		}
	}

	trapFocusHandlers.focusin = (event) => {
		if (event.target !== container && event.target !== last && event.target !== first) return
		if (!trapFocusHandlers.keydown) {
			console.error('no keydown')
			return
		}
		document.addEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.focusout = function () {
		if (!trapFocusHandlers.keydown) {
			console.error('no keydown')
			return
		}
		document.removeEventListener('keydown', trapFocusHandlers.keydown)
	}

	document.addEventListener('focusout', trapFocusHandlers.focusout)
	document.addEventListener('focusin', trapFocusHandlers.focusin)

	elementToFocus.focus()

	if (
		elementToFocus.tagName === 'INPUT' &&
		elementToFocus instanceof HTMLInputElement &&
		['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
		elementToFocus.value
	) {
		elementToFocus.setSelectionRange(0, elementToFocus.value.length)
	}
}

export function removeTrapFocus(elementToFocus?: HTMLElement) {
	if (trapFocusHandlers.focusin) {
		document.removeEventListener('focusin', trapFocusHandlers.focusin)
	}
	if (trapFocusHandlers.focusout) {
		document.removeEventListener('focusout', trapFocusHandlers.focusout)
	}
	if (trapFocusHandlers.keydown) {
		document.removeEventListener('keydown', trapFocusHandlers.keydown)
	}
	if (elementToFocus) elementToFocus.focus()
}

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

window.addEventListener('DOMContentLoaded', () => initializeScrollAnimationTrigger())

document.addEventListener('shopify:section:load', (event: Event) => {
	initializeScrollAnimationTrigger(targetRequired<Event, Document>(event))
})
