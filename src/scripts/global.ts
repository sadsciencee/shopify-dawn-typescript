import {
	focusVisiblePolyfill,
	getFocusableElements, initializeSummaryA11y,
	targetRequired
} from '@/scripts/functions';

import { type FocusableHTMLElement } from '@/scripts/types/theme'
import { mediaLoader } from '@/scripts/mediaLoader';

// this is a default shopify function that normally runs in global scope
// I moved it to functions for clarity

// trapFocusHandlers variable and associated functions are part of the global scope
// this function should always run first

const trapFocusHandlers: {
	focusin?: (event: Event) => void
	focusout?: (event: Event) => void
	keydown?: (event: KeyboardEvent) => void
} = {}

export function trapFocus(container: HTMLElement, elementToFocus: HTMLElement | undefined = container) {
	const elements = getFocusableElements(container)
	const first = elements[0]
	const last = elements[elements.length - 1]

	removeTrapFocus()

	trapFocusHandlers.focusin = (event) => {
		if (event.target !== container && event.target !== last && event.target !== first) return

		if (!trapFocusHandlers.keydown)
			throw new Error('trapFocusHandlers.focusin called before .keydown is defined')

		document.addEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.focusout = function () {
		if (!trapFocusHandlers.keydown)
			throw new Error('trapFocusHandlers.focusout called before .keydown is defined')
		document.removeEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.keydown = function (event: KeyboardEvent) {
		if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		const target = targetRequired<KeyboardEvent, FocusableHTMLElement>(event)
		if (target === last && !event.shiftKey) {
			event.preventDefault()
			first.focus()
		}

		//  On the first focusable element and tab backward, focus the last element.
		if ((event.target === container || event.target === first) && event.shiftKey) {
			event.preventDefault()
			last.focus()
		}
	}

	document.addEventListener('focusout', trapFocusHandlers.focusout)
	document.addEventListener('focusin', trapFocusHandlers.focusin)

	elementToFocus.focus()

	if (
		elementToFocus instanceof HTMLInputElement &&
		['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
		elementToFocus.value
	) {
		elementToFocus.setSelectionRange(0, elementToFocus.value.length)
	}
}



// don't know why shopify put this function below the above but I'm not about to go debug it

export function removeTrapFocus(elementToFocus: HTMLElement | undefined = undefined) {
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
export function globalSetup() {
	initializeSummaryA11y()
	try {
		document.querySelector(':focus-visible')
	} catch (e) {
		focusVisiblePolyfill()
	}
// mediaLoader
	mediaLoader()
}
