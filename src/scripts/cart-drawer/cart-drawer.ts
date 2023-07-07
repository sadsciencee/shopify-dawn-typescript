import { ShopifySectionRenderingSchema } from '@/scripts/types/theme'
import { SectionApiResponse } from '@/scripts/types/responses'
import {
	closestOptional,
	currentTargetRequired,
	onKeyUpEscape,
	qsOptional,
	qsRequired,
} from '@/scripts/functions'
import { removeTrapFocus, trapFocus } from '@/scripts/global'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class CartDrawer extends UcoastEl {
	static htmlSelector = 'cart-drawer'
	activeElement?: HTMLElement
	productId?: string
	constructor() {
		super()

		this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close())
		this.getOverlay().addEventListener('click', this.close.bind(this))
		this.setHeaderCartIconAccessibility()
	}

	getOverlay() {
		return qsRequired('#CartDrawer-Overlay', this)
	}

	setHeaderCartIconAccessibility() {
		const cartLink = qsRequired('#cart-icon-bubble')
		cartLink.setAttribute('role', 'button')
		cartLink.setAttribute('aria-haspopup', 'dialog')
		cartLink.addEventListener('click', (event) => {
			event.preventDefault()
			this.open(cartLink)
		})
		cartLink.addEventListener('keydown', (event) => {
			if (event.code.toUpperCase() === 'SPACE') {
				event.preventDefault()
				this.open(cartLink)
			}
		})
	}

	open(triggeredBy?: HTMLElement) {
		if (triggeredBy) this.setActiveElement(triggeredBy)
		const cartDrawerNote = qsOptional('[id^="Details-"] summary', this)
		if (cartDrawerNote && !cartDrawerNote.hasAttribute('role'))
			this.setSummaryAccessibility(cartDrawerNote)
		// here the animation doesn't seem to always get triggered. A timeout seem to help
		setTimeout(() => {
			this.classList.add('animate', 'active')
		}, 1)

		this.addEventListener(
			'transitionend',
			() => {
				const containerToTrapFocusOn = this.classList.contains('is-empty')
					? qsRequired('.drawer__inner-empty', this)
					: qsRequired('#CartDrawer')
				const focusElement =
					qsOptional('.drawer__inner', this) || qsRequired('.drawer__close', this)
				trapFocus(containerToTrapFocusOn, focusElement)
			},
			{ once: true }
		)

		document.body.classList.add('overflow-hidden')
	}

	close() {
		this.classList.remove('active')
		removeTrapFocus(this.activeElement)
		document.body.classList.remove('overflow-hidden')
	}

	setSummaryAccessibility(cartDrawerNote: HTMLElement) {
		const parentElement = cartDrawerNote.parentElement
		if (!parentElement)
			throw new Error('setSummaryAccessibility failed - No parent element found')
		cartDrawerNote.setAttribute('role', 'button')
		cartDrawerNote.setAttribute('aria-expanded', 'false')
		const nextElementSibling = cartDrawerNote.nextElementSibling

		if (nextElementSibling instanceof HTMLElement && nextElementSibling.hasAttribute('id')) {
			cartDrawerNote.setAttribute('aria-controls', nextElementSibling.id)
		}

		cartDrawerNote.addEventListener('click', (event: MouseEvent) => {
			const currentTarget = currentTargetRequired(event)
			const closestDetails = closestOptional(currentTarget, 'details')
			currentTarget.setAttribute('aria-expanded', `${!closestDetails?.hasAttribute('open')}`)
		})

		parentElement.addEventListener('keyup', onKeyUpEscape)
	}

	renderContents(parsedState: SectionApiResponse) {
		qsRequired('.drawer__inner', this).classList.contains('is-empty') &&
			qsRequired('.drawer__inner', this).classList.remove('is-empty')
		this.productId = parsedState.id
		this.getSectionsToRender().forEach((section) => {
			const sectionId = section.id
			if (!sectionId) throw new Error('Section id is required')
			const sectionElement = section.selector
				? qsRequired(section.selector)
				: qsRequired(`#${sectionId}`)
			sectionElement.innerHTML = this.getSectionInnerHTML(
				parsedState.sections[sectionId],
				section.selector
			)
		})

		setTimeout(() => {
			this.getOverlay().addEventListener('click', this.close.bind(this))
			this.open()
		})
	}

	getSectionInnerHTML(html: string, selector = '.shopify-section') {
		const newDocument = new DOMParser().parseFromString(html, 'text/html')
		return qsRequired(selector, newDocument.documentElement).innerHTML
	}

	getSectionsToRender(): ShopifySectionRenderingSchema[] {
		return [
			{
				id: 'cart-drawer',
				selector: '#CartDrawer',
			},
			{
				id: 'cart-icon-bubble',
			},
		]
	}

	getSectionDOM(html: string, selector = '.shopify-section') {
		return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)
	}

	setActiveElement(element: HTMLElement) {
		this.activeElement = element
	}
}
