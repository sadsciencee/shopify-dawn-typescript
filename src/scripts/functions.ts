// in general, these functions are for enforcing types when access HTML dom elements so I don't have to think about it so much
// right now I've avoided any other helper functions but if we get another sub category of functions we should change this to a folder 'functions'

import { type KlaviyoPopup, type Modal, type NotifyMe } from '@/scripts/content/modal'
import { type QuickAddModal } from '@/scripts/product/quick-add'

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
export type EventWithRelatedTarget = MouseEvent | FocusEvent | DragEvent | PointerEvent

// return a required HTML element or throw null. this is mainly for class component constructors where an error should be thrown if the element is not found.
// allows passing in an additional property, for instances where an HTML element is accessed from a property of the query selector
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
	if (!closest) throw new Error(`required element not found: ${element.nodeName}.closest(${selector})`)
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

// throw error when unable to get required value
export const getOrThrow = <T extends FormData | Map<any, any> = FormData>(data: T, key: string) => {
	const value = data.get(key)
	if (!value) throw new Error(`Value ${key} not found in ${data}`)
	return value
}
// return undefined when unable to get required value
export const getOrUndefined = <T extends FormData | Map<any, any> = FormData>(
	data: T,
	key: string
) => {
	const value = data.get(key)
	if (!value) return undefined
	return value
}

// get attribute or throw
export const getAttributeOrThrow = (attribute: string, el: HTMLElement) => {
	const data = el.getAttribute(attribute)
	if (!data) throw new Error(`Attribute ${attribute} no found on element ${el}`)
	return data
}
export const replaceAll = (str: string, find: string, replace: string) => {
	return str.split(find).join(replace)
}

export const toggleActive = (el: HTMLElement, active: boolean) => {
	if (active) {
		el.setAttribute('data-uc-active', '')
	} else {
		el.removeAttribute('data-uc-active')
	}
}

export const toggleIsEmpty = (el: HTMLElement, isEmpty: boolean) => {
	if (isEmpty) {
		el.setAttribute('data-uc-is-empty', '')
	} else {
		el.removeAttribute('data-uc-is-empty')
	}
}

export const toggleLoading = (el: HTMLElement, loading: boolean) => {
	if (loading) {
		el.setAttribute('data-uc-loading', '')
	} else {
		el.removeAttribute('data-uc-loading')
	}
}

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

export const getBackendRoute = () => {
	return 'https://duster-klaviyo-integration.herokuapp.com'
	//return 'http://localhost:5000'
}

export function onKeyUpEscape(event: KeyboardEvent) {
	if (!(event instanceof KeyboardEvent)) return
	if (event.code.toUpperCase() !== 'ESCAPE') return
	const target = event.target as HTMLElement | EventTarget | null
	if (!(target instanceof HTMLElement)) return
	const openDetailsElement = target?.closest('details[open]')
	if (!openDetailsElement) return

	const summaryElement = openDetailsElement.querySelector('summary')
	openDetailsElement.removeAttribute('open')
	if (!summaryElement) return
	summaryElement.setAttribute('aria-expanded', '')
	summaryElement.focus()
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

export const closeAllModals = () => {
	const modals = qsaOptional<Modal | KlaviyoPopup | NotifyMe | QuickAddModal>(
		'modal-dialog, klaviyo-popup, notify-me, quick-add-modal'
	)
	if (!modals) return
	modals.forEach((modal) => {
		if (typeof modal.hide === 'function' && modal.hasAttribute('open')) {
			modal.hide()
		}
	})
}

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

export const scaleValue = (val: number, viewport: 'mobile' | 'desktop') => {
	let ratio = viewport === 'desktop' ? 1440 / window.innerWidth : 375 / window.innerWidth
	if (viewport === 'desktop' && ratio > 1.25) ratio = 1.25 // this is a reverse of the 1:.8 ratio from desktop min in css
	if (viewport === 'desktop' && ratio < 1) ratio = 1 // this is a verse of the 1:1.15 ratio from desktop max in css
	if (viewport === 'mobile' && ratio > 1.1111111111) ratio = 1.1111111111
	if (viewport === 'mobile' && ratio < 1) ratio = 1
	return (val * ratio).toFixed(1)
}

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

export const setDrawerHeight = () => {
	document.documentElement.style.setProperty('--drawer-height', `${window.innerHeight}px`)
}
