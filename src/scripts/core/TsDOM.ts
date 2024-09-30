import type {
	DebounceCallback,
	EventWithRelatedTarget,
	FocusableHTMLElement,
} from '@/scripts/types/theme'

function getFocusableElements(container: HTMLElement): FocusableHTMLElement[] {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	)
}

interface CustomElementConstructorWithStaticTagName
	extends CustomElementConstructor {
	htmlSelector: string
}

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

export class TsDOM {
	trap: {
		focusin?: (event: Event) => void
		focusout?: (event: Event) => void
		keydown?: (event: KeyboardEvent) => void
	}
	shopifyConsentAPILoaded: boolean
	iOS: boolean
	openMenuId?: string
	openSubmenuId?: string
	screen: {
		width: number
		height: number
		portrait: boolean
	}
	editor: {
		selectedBlock: string | undefined
	}

	constructor() {
		this.trap = {}
		this.iOS = false
		this.shopifyConsentAPILoaded = false
		this.editor = {
			selectedBlock: undefined,
		}
		this.screen = {
			width: window.innerWidth,
			height: window.innerHeight,
			portrait: window.innerHeight > window.innerWidth,
		}
	}

	// select single or throw
	static rs<T extends HTMLElement = HTMLElement, U extends HTMLElement = T>(
		selector: string,
		component?: HTMLElement | Document,
		additionalProperty?: HTMLElementProperty
	) {
		const container = component ?? document
		const element = container.querySelector(selector) as T | null
		if (!element) throw new Error(`required element not found: ${selector}`)
		if (!additionalProperty) return element
		const elFromProperty = element[additionalProperty] as U | null
		if (!elFromProperty)
			throw new Error(`required element not found: ${selector}`)
		return elFromProperty
	}

	// select single or undefined
	static os<T extends HTMLElement = HTMLElement, U extends HTMLElement = T>(
		selector: string,
		component?: HTMLElement | Document,
		additionalProperty?: HTMLElementProperty
	) {
		try {
			return this.rs<T, U>(selector, component, additionalProperty)
		} catch {
			return undefined
		}
	}

	// select list or throw
	static rl<T extends HTMLElement = HTMLElement>(
		selector: string,
		component?: HTMLElement | Document
	) {
		const container = component ?? document
		const elements = container.querySelectorAll(selector) as NodeListOf<T>
		if (!elements.length)
			throw new Error(`required element group not found: ${selector}`)
		return elements
	}

	// select list or undefined
	static ol<T extends HTMLElement = HTMLElement>(
		selector: string,
		component?: HTMLElement | Document
	) {
		try {
			return this.rl<T>(selector, component)
		} catch {
			return undefined
		}
	}

	// select target or throw
	static rt<
		E extends Event = CommonEventType,
		T extends HTMLElement | Document = HTMLElement,
	>(event: E) {
		const element = event.target as T | null
		if (!element)
			throw new Error(`required element not found: event.currentTarget`)
		return element
	}

	// select target or undefined
	static ot<
		E extends Event = CommonEventType,
		T extends HTMLElement | Document = HTMLElement,
	>(event: E) {
		try {
			return this.rt<E, T>(event)
		} catch {
			return undefined
		}
	}

	// select currentTarget or throw
	static rct<
		E extends Event = CommonEventType,
		T extends HTMLElement = HTMLElement,
	>(event: E) {
		const element = event.currentTarget as (EventTarget & T) | null
		if (!element)
			throw new Error(`required element not found: event.currentTarget`)
		return element
	}

	// select currentTarget or undefined
	static oct<
		E extends Event = CommonEventType,
		T extends HTMLElement = HTMLElement,
	>(event: E) {
		try {
			return this.rct<E, T>(event)
		} catch {
			return undefined
		}
	}

	// select relatedTarget or throw
	static rrt<
		E extends EventWithRelatedTarget = EventWithRelatedTarget,
		T extends HTMLElement = HTMLElement,
	>(event: E) {
		const element = event.relatedTarget as (EventTarget & T) | null
		if (!element)
			throw new Error(`required element not found: event.currentTarget`)
		return element
	}

	// select relatedTarget or undefined
	static ort<
		E extends EventWithRelatedTarget = EventWithRelatedTarget,
		T extends HTMLElement = HTMLElement,
	>(event: E) {
		try {
			return this.rrt<E, T>(event)
		} catch {
			return undefined
		}
	}

	// select closest target or throw
	static rClosestTarget<
		E extends Event = CommonEventType,
		T extends HTMLElement = HTMLElement,
	>(event: E, selector: string) {
		const element = event.target as T | null
		if (!element)
			throw new Error(`required element not found: event.currentTarget`)
		const closest = element.closest(selector) as T
		if (!closest)
			throw new Error(
				`required element not found: ${element.nodeName}.closest(${selector})`
			)
		return closest
	}

	// select closest target or undefined
	static oClosestTarget<
		E extends Event = CommonEventType,
		T extends HTMLElement = HTMLElement,
	>(event: E, selector: string) {
		try {
			return this.rClosestTarget<E, T>(event, selector)
		} catch {
			return undefined
		}
	}

	// select closest element or throw
	static rc<T extends HTMLElement = HTMLElement>(
		element: HTMLElement,
		selector: string
	) {
		const closest = element.closest(selector) as T
		if (!closest)
			throw new Error(
				`required element not found: ${element.nodeName}.closest(${selector})`
			)
		return closest
	}

	// select closest element or undefined
	static oc<T extends HTMLElement = HTMLElement>(
		element: HTMLElement,
		selector: string
	) {
		try {
			return this.rc<T>(element, selector)
		} catch {
			return undefined
		}
	}

	// get element data attribute or throw
	static ra(el: HTMLElement, a: string) {
		const data = el.getAttribute(a)
		if (!data)
			throw new Error(`Attribute ${a} no found on element ${{ el }}`)
		return data
	}

	// get element data attribute or undefined
	static oa(el: HTMLElement, att: string) {
		try {
			return this.ra(el, att)
		} catch {
			return undefined
		}
	}

	// get form data or throw
	static rfd<T extends FormData | Map<any, any> = FormData>(
		data: T,
		key: string
	) {
		const value = data.get(key)
		if (!value) throw new Error(`Value ${key} not found in ${data}`)
		return value
	}

	// get form data or undefined
	static ofd<T extends FormData | Map<any, any> = FormData>(
		data: T,
		key: string
	) {
		try {
			return this.rfd(data, key)
		} catch {
			return undefined
		}
	}

	// general helpers, not necessarily going to keep these but dropping here for now
	static onKeyUpEscape(event: KeyboardEvent) {
		if (event.code?.toUpperCase() !== 'ESCAPE') return

		const openDetailsElement = this.oClosestTarget(event, 'details[open]')
		if (!openDetailsElement) return

		const summaryElement = this.rs('summary', openDetailsElement)
		openDetailsElement.removeAttribute('open')
		summaryElement.setAttribute('aria-expanded', 'false')
		summaryElement.focus()
	}

	static getDistanceFromDocumentTop(element: Element, scrollTop: number) {
		const rect = element.getBoundingClientRect()
		return rect.top + scrollTop
	}

	static safeDefineElement(
		elementClass: CustomElementConstructorWithStaticTagName,
		callbackBefore?: Function,
		callbackAfter?: Function
	) {
		try {
			if (customElements.get(elementClass.htmlSelector)) return
			if (callbackBefore instanceof Function) {
				const elsInDocument = this.ol(elementClass.htmlSelector)
				if (elsInDocument) {
					callbackBefore()
				}
			}
			customElements.define(elementClass.htmlSelector, elementClass)
			if (callbackAfter instanceof Function) {
				const elsInDocument = this.ol(elementClass.htmlSelector)
				if (elsInDocument) {
					callbackAfter()
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error(
					`Failed to define custom element '${elementClass.htmlSelector}': ${error.message}`
				)
			} else {
				console.error(
					`Failed to define custom element '${elementClass.htmlSelector}': ${error}`
				)
			}
		}
	}

	static scrollToAnchor(selector: string, handle?: string) {
		const header = this.rs('[data-uc-header-wrapper]')
		const secondaryMenu = this.os('[data-uc-secondary-menu]')
		const anchor = this.rs(selector)
		const headerHeight = secondaryMenu
			? secondaryMenu.offsetHeight
			: header.offsetHeight
		const collectionTop = anchor.getBoundingClientRect().top
		const scrollToPosition =
			collectionTop -
			headerHeight -
			parseFloat(
				window
					?.getComputedStyle(anchor)
					?.getPropertyValue('margin-top') ?? 0
			) +
			1
		window.scrollBy({ top: scrollToPosition, behavior: 'smooth' })
		if (!handle) return
		const focusable = this.os(`[data-anchor-focus="${handle}"]`)
		if (focusable) focusable.focus({ preventScroll: true })
	}

	static setupScrollAnchors() {
		const anchors = this.ol<HTMLButtonElement>('[data-scroll-trigger]')
		anchors?.forEach((button) => {
			const handle = this.ra(button, 'data-scroll-trigger')
			button.addEventListener('click', (e) => {
				e.preventDefault()

				const area = this.os(`[data-scroll-anchor="${handle}"]`)
				if (area) {
					this.scrollToAnchor(
						`[data-scroll-anchor="${handle}"]`,
						handle
					)
				}
			})
		})
	}

	// instance specific functions for focus
	removeTrapFocus(elementToFocus: HTMLElement | undefined = undefined) {
		if (this.trap.focusin) {
			document.removeEventListener('focusin', this.trap.focusin)
		}
		if (this.trap.focusout) {
			document.removeEventListener('focusout', this.trap.focusout)
		}

		if (this.trap.keydown) {
			document.removeEventListener('keydown', this.trap.keydown)
		}

		if (elementToFocus) elementToFocus.focus()
	}

	trapFocus(
		container: HTMLElement,
		elementToFocus: HTMLElement | undefined = container
	) {
		const elements = getFocusableElements(container)
		const first = elements[0]
		const last = elements[elements.length - 1]

		this.removeTrapFocus.bind(this)

		this.trap.focusin = (event) => {
			if (
				event.target !== container &&
				event.target !== last &&
				event.target !== first
			)
				return

			if (!this.trap.keydown)
				throw new Error(
					'this.trap.focusin called before .keydown is defined'
				)

			document.addEventListener('keydown', this.trap.keydown)
		}

		this.trap.focusout = () => {
			if (!this.trap.keydown)
				throw new Error(
					'this.trap.focusout called before .keydown is defined'
				)
			document.removeEventListener('keydown', this.trap.keydown)
		}

		this.trap.keydown = (event: KeyboardEvent) => {
			if (event.code?.toUpperCase() !== 'TAB') return // If not TAB key
			// On the last focusable element and tab forward, focus the first element.
			const target = TsDOM.rt<KeyboardEvent, FocusableHTMLElement>(event)
			if (target === last && !event.shiftKey) {
				event.preventDefault()
				first.focus()
			}

			//  On the first focusable element and tab backward, focus the last element.
			if (
				(event.target === container || event.target === first) &&
				event.shiftKey
			) {
				event.preventDefault()
				last.focus()
			}
		}
		document.addEventListener('focusout', this.trap.focusout)
		document.addEventListener('focusin', this.trap.focusin)

		elementToFocus.focus()

		if (
			elementToFocus instanceof HTMLInputElement &&
			['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
			elementToFocus.value
		) {
			elementToFocus.setSelectionRange(0, elementToFocus.value.length)
		}
	}
}

export function debounce(fn: Function, wait: number): DebounceCallback {
	let timeoutId: number
	return (...args: unknown[]) => {
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

export const debouncedHandleResize = debounce(handleResize, 50)

function handleResize() {
	let hasReloaded = false
	if (
		window.innerWidth !== window.TsDOM.screen.width &&
		window.innerHeight === window.TsDOM.screen.height
	) {
		// screen width updates only
		if (window.innerWidth < 990 && window.TsDOM.screen.width >= 990) {
			// screen width has decreased below 990
			//void window.TsDOM.mediaManager.reloadAllDangerously()
			hasReloaded = true
		}
		if (window.innerWidth >= 990 && window.TsDOM.screen.width < 990) {
			// screen width has increased to 990 or above
			//void window.TsDOM.mediaManager.reloadAllDangerously()
			hasReloaded = true
		}
	}
	if (
		window.innerHeight !== window.TsDOM.screen.height &&
		window.innerWidth === window.TsDOM.screen.width
	) {
		// screen height updates only
	}
	if (
		window.innerWidth !== window.TsDOM.screen.width ||
		window.innerHeight !== window.TsDOM.screen.height
	) {
		// update on every change
	}
	if (
		window.innerWidth !== window.TsDOM.screen.width &&
		window.innerHeight !== window.TsDOM.screen.height
	) {
		if (!hasReloaded) {
			const portrait = window.innerHeight > window.innerWidth
			if (portrait !== window.TsDOM.screen.portrait) {
				console.log('scary reload')
				//void window.TsDOM.mediaManager.reloadAllDangerously()
				hasReloaded = true
			}
		}
	}

	window.TsDOM.screen.width = window.innerWidth
	window.TsDOM.screen.height = window.innerHeight
	window.TsDOM.screen.portrait = window.innerHeight > window.innerWidth
}

export function init() {
	if (!window.TsDOM) {
		window.TsDOM = new TsDOM()
	}
}
