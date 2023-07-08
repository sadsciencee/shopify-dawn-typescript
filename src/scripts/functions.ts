// in general, these functions are for enforcing types when access HTML dom elements so I don't have to think about it so much
// right now I've avoided any other helper functions but if we get another sub category of functions we should change this to a folder 'functions'

// TODO: add KlaviyoPopup back in
//import { type KlaviyoPopup, type Modal, type NotifyMe } from '@/scripts/content/modal'
//import { type QuickAddModal } from '@/scripts/optional/quick-add'
import {
	DebounceCallback,
	EventWithRelatedTarget,
	FocusableHTMLElement,
} from '@/scripts/types/theme'
import { ProductModel } from '@/scripts/optional/product-model'
import { ATTRIBUTES } from '@/scripts/theme/constants';

// local types

type HTMLElementProperty =
	| 'parentNode'
	| 'firstChild'
	| 'lastChild'
	| 'previousSibling'
	| 'nextSibling'
	| 'firstElementChild'
	| 'lastElementChild'
	| 'previousElementSibling'
	| 'nextElementSibling'
	| 'parentElement'

type CommonEventType = MouseEvent | KeyboardEvent | TouchEvent

// begin typescript DOM functions
// this is a set of functions I wrote while refactoring Dawn 9.0 to typescript
// ended up being very flexible and useful for enforcing types when accessing dom elements so we are reusing for Dawn 10.0

export const qsRequired = <T extends HTMLElement = HTMLElement, U extends HTMLElement = T>(
	selector: string,
	component?: HTMLElement,
	additionalProperty?: HTMLElementProperty
) => {
	const container = component ?? document
	const element = container.querySelector(selector) as T | null
	if (!element) throw new Error(`required element not found: ${selector}`)
	if (!additionalProperty) return element
	const elFromProperty = element[additionalProperty] as U | null
	if (!elFromProperty) throw new Error(`required element not found: ${selector}`)
	return elFromProperty
}

export const qsRequiredFromDocument = <T extends HTMLElement = HTMLElement>(
	selector: string,
	parsedDocument: Document
) => {
	const element = parsedDocument.querySelector(selector) as T | null
	if (!element) throw `required element not found: ${selector}`
	return element
}

// required querySelectorAll
export const qsaRequired = <T extends HTMLElement = HTMLElement>(
	selector: string,
	component?: HTMLElement | Document
) => {
	const container = component ?? document
	const elements = container.querySelectorAll(selector) as NodeListOf<T>
	if (!elements.length) throw new Error(`required element group not found: ${selector}`)
	return elements
}

// return undefined if the HTML element isn't found
export const qsOptional = <T extends HTMLElement = HTMLElement>(
	selector: string,
	component?: HTMLElement | Document
) => {
	const container = component ?? document
	const element = container.querySelector(selector) as T | null
	return element ?? undefined
}

// optional querySelectorAll typecast
export const qsaOptional = <T extends HTMLElement = HTMLElement>(
	selector: string,
	component?: HTMLElement | Document
) => {
	const container = component ?? document
	const elements = container.querySelectorAll(selector) as NodeListOf<T>
	if (!elements.length) return undefined
	return elements
}

// required event targets
export const currentTargetRequired = <
	E extends Event = CommonEventType,
	T extends HTMLElement = HTMLElement
>(
	event: E
) => {
	const element = event.currentTarget as (EventTarget & T) | null
	if (!element) throw new Error(`required element not found: event.currentTarget`)
	return element
}

export const relatedTargetRequired = <
	E extends EventWithRelatedTarget = EventWithRelatedTarget,
	T extends HTMLElement = HTMLElement
>(
	event: E
) => {
	const element = event.relatedTarget as (EventTarget & T) | null
	if (!element) throw new Error(`required element not found: event.currentTarget`)
	return element
}

export const relatedTargetOptional = <
	E extends EventWithRelatedTarget = EventWithRelatedTarget,
	T extends HTMLElement = HTMLElement
>(
	event: E
) => {
	return (event.relatedTarget as EventTarget & T) ?? undefined
}

export const targetRequired = <
	E extends Event = CommonEventType,
	T extends HTMLElement | Document = HTMLElement
>(
	event: E
) => {
	const element = event.target as T | null
	if (!element) throw new Error(`required element not found: event.currentTarget`)
	return element
}

// optional event targets. this is sort of not important but will probably make type casting easier
export const currentTargetOptional = <
	E extends Event = CommonEventType,
	T extends HTMLElement = HTMLElement
>(
	event: E
) => {
	return (event.currentTarget as EventTarget & T) ?? undefined
}

export const targetOptional = <
	E extends Event = CommonEventType,
	T extends HTMLElement = HTMLElement
>(
	event: E
) => {
	return (event.target as EventTarget & T) ?? undefined
}

export const targetClosestRequired = <
	E extends Event = CommonEventType,
	T extends HTMLElement = HTMLElement
>(
	event: E,
	selector: string
) => {
	const element = event.target as T | null
	if (!element) throw new Error(`required element not found: event.currentTarget`)
	const closest = element.closest(selector) as T
	if (!closest)
		throw new Error(`required element not found: ${element.nodeName}.closest(${selector})`)
	return closest
}

export const targetClosestOptional = <
	E extends Event = CommonEventType,
	T extends HTMLElement = HTMLElement
>(
	event: E,
	selector: string
) => {
	const element = event.target as T | null
	if (!element) return undefined
	const closest = element.closest(selector) as T
	if (!closest) return undefined
	return closest
}

// properties and methods of HTML elements that return an HTMLElement
export const closestRequired = <T extends HTMLElement = HTMLElement>(
	element: HTMLElement,
	selector: string
) => {
	const closest = element.closest(selector) as T
	if (!closest)
		throw new Error(`required element not found: ${element.nodeName}.closest(${selector})`)
	return closest
}

export const closestOptional = <T extends HTMLElement = HTMLElement>(
	element: HTMLElement,
	selector: string
) => {
	return (element.closest(selector) as T) ?? undefined
}

export const elementPropertyRequired = <T extends HTMLElement = HTMLElement>(
	element: HTMLElement,
	property: HTMLElementProperty
) => {
	const parent = element[property] as T | null
	if (!parent) throw new Error(`required element not found: ${element.nodeName}.parentNode`)
	return parent
}

// this function is use to safely define a new custom element
// it allows callbacks to be run before and after the element is defined -
// callback functionality is mainly for shop filters but can apply to any class with heavy usage of static methods

interface CustomElementConstructorWithStaticTagName extends CustomElementConstructor {
	htmlSelector: string
}

// throw error if something goes wrong with a constructor
export const safeDefineElement = (
	elementClass: CustomElementConstructorWithStaticTagName,
	callbackBefore?: Function,
	callbackAfter?: Function
): void => {
	try {
		if (customElements.get(elementClass.htmlSelector)) return
		if (callbackBefore instanceof Function) {
			const elsInDocument = qsaOptional(elementClass.htmlSelector)
			if (elsInDocument) {
				callbackBefore()
			}
		}
		customElements.define(elementClass.htmlSelector, elementClass)
		if (callbackAfter instanceof Function) {
			const elsInDocument = qsaOptional(elementClass.htmlSelector)
			if (elsInDocument) {
				callbackAfter()
			}
		}
	} catch (error) {
		console.error(
			`Failed to define custom element '${elementClass.htmlSelector}': ${error.message}`
		)
	}
}

// formData helpers
export const getOrThrow = <T extends FormData | Map<any, any> = FormData>(data: T, key: string) => {
	const value = data.get(key)
	if (!value) throw new Error(`Value ${key} not found in ${data}`)
	return value
}
export const getOrUndefined = <T extends FormData | Map<any, any> = FormData>(
	data: T,
	key: string
) => {
	const value = data.get(key)
	if (!value) return undefined
	return value
}

// get attribute from element or throw error
export const getAttributeOrThrow = (attribute: string, el: HTMLElement) => {
	const data = el.getAttribute(attribute)
	if (!data) throw new Error(`Attribute ${attribute} no found on element ${el}`)
	return data
}
// browser safe replace all
export const replaceAll = (str: string, find: string, replace: string) => {
	return str.split(find).join(replace)
}

// toggle attributes specific to ucoast builds, not used in default dawn repack
export const toggleActive = (el: HTMLElement, active: boolean) => {
	if (active) {
		el.setAttribute('data-uc-active', '')
	} else {
		el.removeAttribute('data-uc-active')
	}
}

export const toggleIsEmpty = (el: HTMLElement, isEmpty: boolean) => {
	if (isEmpty) {
		el.setAttribute('data-uc-cart-empty', '')
	} else {
		el.removeAttribute('data-uc-cart-empty')
	}
}

export const toggleLoading = (el: HTMLElement, loading: boolean) => {
	if (loading) {
		el.setAttribute(ATTRIBUTES.loading, '')
	} else {
		el.removeAttribute(ATTRIBUTES.loading)
	}
}

// scroll to anchor link with some ucoast-specific features, not used in default dawn repack
export const scrollToAnchor = (selector: string) => {
	const header = qsRequired('[data-uc-header-wrapper]')
	const anchor = qsRequired(selector)
	const headerHeight = header.offsetHeight
	const collectionTop = anchor.getBoundingClientRect().top
	const scrollToPosition =
		collectionTop -
		headerHeight -
		parseFloat(window?.getComputedStyle(anchor)?.getPropertyValue('margin-top') ?? 0) +
		1
	window.scrollBy({ top: scrollToPosition, behavior: 'smooth' })
}

// TODO: refactor to use app proxy for security
export const getBackendRoute = () => {
	return 'http://localhost:5000'
}

export const getCurrentHeaderHeight = () => {
	let height = 0
	const headerSections = qsaRequired('.shopify-section-group-header-group')
	headerSections.forEach((section) => {
		const sectionHeight = section.getBoundingClientRect().height
		height += sectionHeight
	})
	return height
}

/*export const closeAllModals = () => {
	const modals = qsaOptional<Modal | KlaviyoPopup | NotifyMe | QuickAddModal>(
		'modal-dialog, klaviyo-popup, notify-me, quick-add-modal'
	)
	if (!modals) return
	modals.forEach((modal) => {
		if (typeof modal.hide === 'function' && modal.hasAttribute('open')) {
			modal.hide()
		}
	})
}*/

// these three functions are somewhat similar - should be refactored for clarity
export const isElementInViewport = (el: HTMLElement) => {
	const rect = el.getBoundingClientRect()
	const result =
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	return result
}

export const isInViewport = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect()
	return (
		rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
		rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
		rect.bottom > 0 &&
		rect.right > 0
	)
}

export const isTenPercentInViewport = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect()
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight
	const viewportWidth = window.innerWidth || document.documentElement.clientWidth

	const elementHeight = rect.height
	const elementWidth = rect.width

	const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
	const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)

	const visibleArea = Math.max(0, visibleHeight) * Math.max(0, visibleWidth)
	const elementArea = elementHeight * elementWidth

	return visibleArea >= 0.1 * elementArea
}

// this function applies the scaling from the --ax variables. it is project-dependent
// 1440 and 375 are specific to the size I request from designers, however should be refactored as Constants
// TODO: add const defs for hard coded scaling values

export const scaleValue = (val: number, viewport: 'mobile' | 'desktop') => {
	let ratio = viewport === 'desktop' ? 1440 / window.innerWidth : 375 / window.innerWidth
	if (viewport === 'desktop' && ratio > 1.25) ratio = 1.25 // this is a reverse of the 1:.8 ratio from desktop min in css
	if (viewport === 'desktop' && ratio < 1) ratio = 1 // this is a verse of the 1:1.15 ratio from desktop max in css
	if (viewport === 'mobile' && ratio > 1.1111111111) ratio = 1.1111111111
	if (viewport === 'mobile' && ratio < 1) ratio = 1
	return (val * ratio).toFixed(1)
}

// TODO: refactor for default dawn repack
// this sets all relevant height variables for the app

export const setHeightVars = (header: HTMLElement, announcement: HTMLElement | undefined) => {
	const viewport = window.innerWidth >= 990 ? 'desktop' : 'mobile'
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
	document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
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
			summary.setAttribute('aria-controls', getAttributeOrThrow('id', nextElementSibling))
		}

		summary.addEventListener('click', (event) => {
			const currentTarget = currentTargetRequired(event)
			const closestTarget = targetClosestRequired(event, 'details')
			currentTarget.setAttribute('aria-expanded', `${!closestTarget.hasAttribute('open')}`)
		})

		if (summary.closest('header-drawer, menu-drawer')) return
		const parentElement =
			summary.parentElement instanceof HTMLElement ? summary.parentElement : undefined
		if (!parentElement) return
		parentElement.addEventListener('keyup', onKeyUpEscape)
	})
}

export function getFocusableElements(container: HTMLElement): FocusableHTMLElement[] {
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
	let currentFocusedElement: HTMLElement | Element | null = null
	let mouseClick: boolean | null = null

	window.addEventListener('keydown', (event) => {
		if (navKeys.includes(event.code.toUpperCase())) {
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

export function onKeyUpEscape(event: KeyboardEvent) {
	if (event.code.toUpperCase() !== 'ESCAPE') return

	const openDetailsElement = targetClosestOptional(event, 'details[open]')
	if (!openDetailsElement) return

	const summaryElement = qsRequired('summary', openDetailsElement)
	openDetailsElement.removeAttribute('open')
	summaryElement.setAttribute('aria-expanded', 'false')
	summaryElement.focus()
}

export function pauseAllMedia() {
	const jsYoutubeEls = qsaOptional<HTMLIFrameElement>('.js-youtube')
	if (jsYoutubeEls) {
		jsYoutubeEls.forEach((video) => {
			if (!video.contentWindow) return
			video.contentWindow.postMessage(
				'{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
				'*'
			)
		})
	}

	const jsVimeoEls = qsaOptional<HTMLIFrameElement>('.js-vimeo')
	if (jsVimeoEls) {
		jsVimeoEls.forEach((video) => {
			if (!video.contentWindow) return
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

// event based functions

export function debounce(fn: Function, wait: number): DebounceCallback {
	let timeoutId: number
	return (...args) => {
		clearTimeout(timeoutId)
		// @ts-ignore
		// since this is a generic function that can literally be used for anything, I think 'any' is the best type here
		// 'unknown' would be better but we can't assign a type without moving off of arrow functions
		timeoutId = setTimeout(() => fn.apply(this, args), wait)
	}
}
export function throttle(fn: Function, delay: number = 0) {
	let lastCall = 0
	return function (...args: unknown[]) {
		const now = new Date().getTime()
		if (now - lastCall < delay) {
			return
		}
		lastCall = now
		return fn(...args)
	}
}

// fetch API configs

export function fetchConfig(type = 'json') {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
	}
}

type AddToCartFormValues = {
	items: { quantity: number; id: number }[]
	form_type: string
	sections?: string
	sections_url?: string
}

export function addToCartConfig(body: FormData) {
	const quantity = getOrUndefined(body, 'quantity') ? parseInt(getOrThrow(body, 'quantity')) : 1
	const data: AddToCartFormValues = {
		items: [
			{
				quantity,
				id: parseInt(getOrThrow(body, 'id')),
			},
		],
		form_type: getOrThrow(body, 'form_type'),
		sections: getOrUndefined(body, 'sections'),
		sections_url: getOrUndefined(body, 'sections_url'),
	}
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: `application/json`,
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify(data),
	}
}

// klaviyo & notify me not part of initial dawn but will be in every project

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

// recentlyViewedProducts isn't part of dawn, but it's in my 9.0 build pack so leaving here for now

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

export function parseFormData(formData: FormData) {
	const formDataObj: Record<string, string> = {};
	formData.forEach((value, key:string) => {
		formDataObj[key] = value.toString();
	});
	return formDataObj;
}

// used in critical.js

export function disableDesktopCSS() {
	if (window.innerWidth >= 990) return
	const mUp = qsaOptional('link[href*=".m-up"]')
	mUp?.forEach((link) => {
		const href = link.getAttribute('href')
		if (!href) return
		link.removeAttribute('href')
		link.setAttribute('data-href', href)
	})
	if (window.innerWidth < 750) {
		const sUp = qsaOptional('link[href*=".s-up"]');
		sUp?.forEach((link) => {
			const href = link.getAttribute('href')
			if (!href) return
			link.removeAttribute('href')
			link.setAttribute('data-href', href)
		})
		return
	}



}
