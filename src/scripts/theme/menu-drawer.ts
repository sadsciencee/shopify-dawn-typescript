import {
	closestOptional,
	currentTargetRequired,
	qsaOptional,
	qsOptional,
	qsRequired,
	targetClosestOptional,
	targetClosestRequired,
} from '@/scripts/functions'
import { removeTrapFocus, trapFocus } from '@/scripts/global'
import { UcoastEl } from '@/scripts/core/UcoastEl'
import { ATTRIBUTES } from '@/scripts/theme/constants'

export class MenuDrawer extends UcoastEl {
	static htmlSelector = 'menu-drawer'
	static selectors = {
		element: MenuDrawer.htmlSelector,
		mainDetails: '[data-uc-drawer-main-details]',
		mainSummary: '[data-uc-drawer-main-summary]',
		subDetails: '[data-uc-drawer-sub-details]',
		subSummary: '[data-uc-drawer-sub-summary]',
		submenu: `[${ATTRIBUTES.submenu}]`,
		submenuOpen: `[${ATTRIBUTES.submenu}="open"]`,
		applyButton: `[data-uc-facet-apply]`,
	}
	instanceSelectors = MenuDrawer.selectors
	mainDetails: HTMLDetailsElement
	mainSummary: HTMLElement
	subDetails?: NodeListOf<HTMLDetailsElement>
	subSummaries?: NodeListOf<HTMLElement>
	applyButtons?: NodeListOf<HTMLButtonElement>
	constructor() {
		super()
		this.getInstanceSelectors()
		this.mainDetails = qsRequired(this.instanceSelectors.mainDetails, this)
		this.mainSummary = qsRequired(this.instanceSelectors.mainSummary, this)
		this.subDetails = qsaOptional(this.instanceSelectors.subDetails, this)
		this.subSummaries = qsaOptional(this.instanceSelectors.subSummary, this)
		// apply filters buttons
		this.applyButtons = qsaOptional(this.instanceSelectors.applyButton, this)
		this.addEventListener('keyup', this.onKeyUp.bind(this))
		this.addEventListener('focusout', this.onFocusOut.bind(this))
		this.bindEvents()
	}

	onReload() {
		this.mainDetails = qsRequired(this.instanceSelectors.mainDetails, this)
		this.mainSummary = qsRequired(this.instanceSelectors.mainSummary, this)
		this.subDetails = qsaOptional(this.instanceSelectors.subDetails, this)
		this.subSummaries = qsaOptional(this.instanceSelectors.subSummary, this)
		this.applyButtons = qsaOptional(this.instanceSelectors.applyButton, this)
		this.bindEvents()
	}

	getInstanceSelectors() {
		this.instanceSelectors = MenuDrawer.selectors
	}

	bindEvents() {
		this.mainSummary.addEventListener('click', this.onMainSummaryClick.bind(this))
		this.subSummaries?.forEach((summary) =>
			summary.addEventListener('click', this.onSubSummaryClick.bind(this))
		)
		this.applyButtons?.forEach((button) =>
			button.addEventListener('click', this.onApplyButtonClick.bind(this))
		)
		this.querySelectorAll('button:not(.localization-selector)').forEach((button) =>
			button.addEventListener('click', this.onCloseButtonClick.bind(this))
		)
	}

	onApplyButtonClick(event: MouseEvent) {
		event.preventDefault()
		this.mainSummary.click()
	}

	onKeyUp(event: KeyboardEvent) {
		if (event.code.toUpperCase() !== 'ESCAPE') return

		const openDetailsElement = targetClosestOptional(event, 'details[open]')
		if (!openDetailsElement) return

		openDetailsElement === this.mainDetails
			? this.closeMenuDrawer(event, this.mainSummary)
			: this.closeSubmenu(openDetailsElement)
	}

	onAllSummaryClick(event: MouseEvent) {
		const summaryElement = currentTargetRequired(event)
		const detailsElement = summaryElement.parentNode
		if (!(detailsElement instanceof HTMLElement)) throw new Error('detailsElement is null')
		const parentMenuElement = closestOptional(detailsElement, this.instanceSelectors.submenu)
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
		return {
			detailsElement,
			summaryElement,
			parentMenuElement,
			isOpen,
			reducedMotion,
			addTrapFocus,
		}
	}

	onMainSummaryClick(event: MouseEvent) {
		const { isOpen, summaryElement } = this.onAllSummaryClick(event)
		if (isOpen) event.preventDefault()
		isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement)

		if (window.matchMedia('(max-width: 990px)')) {
			document.documentElement.style.setProperty(
				'--viewport-height',
				`${window.innerHeight}px`
			)
		}
	}

	onSubSummaryClick(event: MouseEvent) {
		const { parentMenuElement, reducedMotion, addTrapFocus, detailsElement, summaryElement } =
			this.onAllSummaryClick(event)
		setTimeout(() => {
			detailsElement.setAttribute(ATTRIBUTES.menuOpening, '')
			summaryElement.setAttribute('aria-expanded', 'true')
			parentMenuElement && parentMenuElement.setAttribute(ATTRIBUTES.submenu, 'open')
			!reducedMotion || reducedMotion.matches
				? addTrapFocus()
				: summaryElement.nextElementSibling?.addEventListener('transitionend', addTrapFocus)
		}, 100)
	}

	openMenuDrawer(summaryElement: HTMLElement) {
		setTimeout(() => {
			this.mainDetails.setAttribute(ATTRIBUTES.menuOpening, '')
		})
		summaryElement.setAttribute('aria-expanded', 'true')
		trapFocus(this.mainDetails, summaryElement)
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
	}

	closeMenuDrawer(event: Event | undefined, elementToFocus: HTMLElement | undefined = undefined) {
		if (event === undefined) return

		this.mainDetails.removeAttribute(ATTRIBUTES.menuOpening)
		this.mainDetails.querySelectorAll('details').forEach((details) => {
			details.removeAttribute('open')
			details.removeAttribute(ATTRIBUTES.menuOpening)
		})
		this.mainDetails.querySelectorAll(ATTRIBUTES.submenu).forEach((submenu) => {
			submenu.setAttribute(ATTRIBUTES.submenu, 'closed')
		})
		document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`)
		removeTrapFocus(elementToFocus)
		this.closeAnimation(this.mainDetails)

		if (event instanceof KeyboardEvent) elementToFocus?.setAttribute('aria-expanded', 'false')
	}

	onFocusOut(event: Event) {
		setTimeout(() => {
			if (
				this.mainDetails.hasAttribute('open') &&
				!this.mainDetails.contains(document.activeElement)
			)
				this.closeMenuDrawer(event)
		})
	}

	onCloseButtonClick(event: MouseEvent) {
		const detailsElement = targetClosestRequired(event, 'details')
		this.closeSubmenu(detailsElement)
	}

	closeSubmenu(detailsElement: HTMLElement) {
		const parentMenuElement = detailsElement.closest(this.instanceSelectors.submenuOpen)
		parentMenuElement && parentMenuElement.setAttribute(ATTRIBUTES.submenu, 'closed')
		detailsElement.removeAttribute(ATTRIBUTES.menuOpening)
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
