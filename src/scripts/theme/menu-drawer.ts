import {
	closestOptional,
	currentTargetRequired,
	qsOptional,
	qsRequired,
	targetClosestOptional,
	targetClosestRequired,
} from '@/scripts/functions'
import { removeTrapFocus, trapFocus } from '@/scripts/global'
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class MenuDrawer extends UcoastEl {
	static htmlSelector = 'menu-drawer'
	mainDetailsToggle: HTMLDetailsElement
	constructor() {
		super()

		this.mainDetailsToggle = qsRequired('details', this)

		this.addEventListener('keyup', this.onKeyUp.bind(this))
		this.addEventListener('focusout', this.onFocusOut.bind(this))
		this.bindEvents()
	}

	bindEvents() {
		this.querySelectorAll('summary').forEach((summary) =>
			summary.addEventListener('click', this.onSummaryClick.bind(this))
		)
		this.querySelectorAll('button:not(.localization-selector)').forEach((button) =>
			button.addEventListener('click', this.onCloseButtonClick.bind(this))
		)
	}

	onKeyUp(event: KeyboardEvent) {
		if (event.code.toUpperCase() !== 'ESCAPE') return

		const openDetailsElement = targetClosestOptional(event, 'details[open]')
		if (!openDetailsElement) return

		openDetailsElement === this.mainDetailsToggle
			? this.closeMenuDrawer(event, qsOptional('summary', this.mainDetailsToggle))
			: this.closeSubmenu(openDetailsElement)
	}

	onSummaryClick(event: MouseEvent) {
		const summaryElement = currentTargetRequired(event)
		const detailsElement = summaryElement.parentNode
		if (!(detailsElement instanceof HTMLElement)) throw new Error('detailsElement is null')
		const parentMenuElement = closestOptional(detailsElement, '.has-submenu')
		const isOpen = detailsElement.hasAttribute('open')
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

		function addTrapFocus() {
			const nextElementSibling = summaryElement.nextElementSibling
			if (!(detailsElement instanceof HTMLElement))
				throw new Error('cannot addTrapFocus, detailsElement is null')
			if (!(nextElementSibling instanceof HTMLElement))
				throw new Error('cannot addTrapFocus, nextElementSibling is null')

			trapFocus(nextElementSibling, qsOptional('button', detailsElement))
			nextElementSibling.removeEventListener('transitionend', addTrapFocus)
		}

		if (detailsElement === this.mainDetailsToggle) {
			if (isOpen) event.preventDefault()
			isOpen
				? this.closeMenuDrawer(event, summaryElement)
				: this.openMenuDrawer(summaryElement)

			if (window.matchMedia('(max-width: 990px)')) {
				document.documentElement.style.setProperty(
					'--viewport-height',
					`${window.innerHeight}px`
				)
			}
		} else {
			setTimeout(() => {
				detailsElement.classList.add('menu-opening')
				summaryElement.setAttribute('aria-expanded', 'true')
				parentMenuElement && parentMenuElement.classList.add('submenu-open')
				!reducedMotion || reducedMotion.matches
					? addTrapFocus()
					: summaryElement.nextElementSibling?.addEventListener(
							'transitionend',
							addTrapFocus
					  )
			}, 100)
		}
	}

	openMenuDrawer(summaryElement: HTMLElement) {
		setTimeout(() => {
			this.mainDetailsToggle.classList.add('menu-opening')
		})
		summaryElement.setAttribute('aria-expanded', 'true')
		trapFocus(this.mainDetailsToggle, summaryElement)
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
	}

	closeMenuDrawer(event: Event | undefined, elementToFocus: HTMLElement | undefined = undefined) {
		if (event === undefined) return

		this.mainDetailsToggle.classList.remove('menu-opening')
		this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
			details.removeAttribute('open')
			details.classList.remove('menu-opening')
		})
		this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach((submenu) => {
			submenu.classList.remove('submenu-open')
		})
		document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`)
		removeTrapFocus(elementToFocus)
		this.closeAnimation(this.mainDetailsToggle)

		if (event instanceof KeyboardEvent) elementToFocus?.setAttribute('aria-expanded', 'false')
	}

	onFocusOut(event: Event) {
		setTimeout(() => {
			if (
				this.mainDetailsToggle.hasAttribute('open') &&
				!this.mainDetailsToggle.contains(document.activeElement)
			)
				this.closeMenuDrawer(event)
		})
	}

	onCloseButtonClick(event: MouseEvent) {
		const detailsElement = targetClosestRequired(event, 'details')
		this.closeSubmenu(detailsElement)
	}

	closeSubmenu(detailsElement: HTMLElement) {
		const parentMenuElement = detailsElement.closest('.submenu-open')
		parentMenuElement && parentMenuElement.classList.remove('submenu-open')
		detailsElement.classList.remove('menu-opening')
		const summaryElement = qsRequired('summary', detailsElement)
		summaryElement.setAttribute('aria-expanded', 'false')
		removeTrapFocus(summaryElement)
		this.closeAnimation(detailsElement)
	}

	closeAnimation(detailsElement: HTMLElement) {
		let animationStart: number | undefined

		const handleAnimation = (time: number) => {
			if (animationStart === undefined) {
				animationStart = time
			}

			const elapsedTime = time - animationStart

			if (elapsedTime < 400) {
				window.requestAnimationFrame(handleAnimation)
			} else {
				detailsElement.removeAttribute('open')
				const closestDetails = closestOptional(detailsElement, 'details[open]')
				if (closestDetails) {
					const summaryElement = qsRequired('summary', detailsElement)
					trapFocus(closestDetails, summaryElement)
				}
			}
		}

		window.requestAnimationFrame(handleAnimation)
	}
}
