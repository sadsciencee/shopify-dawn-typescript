import {
	closestOptional,
	qsOptional,
	qsRequired,
	targetClosestOptional,
	targetRequired,
} from '@/scripts/functions'
import { removeTrapFocus, trapFocus } from '@/scripts/theme/global'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class DetailsModal extends UcoastEl {
	static htmlSelector = 'details-modal'
	detailsContainer: HTMLDetailsElement
	summaryToggle: HTMLElement
	button: HTMLButtonElement
	onBodyClickEvent?: (event: MouseEvent) => undefined
	constructor() {
		super()
		this.detailsContainer = qsRequired('details', this)
		this.summaryToggle = qsRequired('summary', this)
		this.button = qsRequired('button[type="button"]', this)

		this.detailsContainer.addEventListener(
			'keyup',
			(event) => event.code.toUpperCase() === 'ESCAPE' && this.close()
		)
		this.summaryToggle.addEventListener('click', this.onSummaryClick.bind(this))
		this.button.addEventListener('click', this.close.bind(this))

		this.summaryToggle.setAttribute('role', 'button')
	}

	isOpen() {
		return this.detailsContainer.hasAttribute('open')
	}

	onSummaryClick(event: MouseEvent) {
		event.preventDefault()
		const closestDetails = targetClosestOptional(event, 'details')
		closestDetails?.hasAttribute('open')
			? this.close()
			: this.open({
					target: targetRequired(event),
			  })
	}

	onBodyClick(event: MouseEvent) {
		const target = targetRequired(event)
		if (!this.contains(target) || target.classList.contains('modal-overlay')) this.close(false)
	}

	open(event: { target: HTMLElement }) {
		this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this)
		if (!this.onBodyClickEvent) throw new Error('onBodyClickEvent is undefined')
		const closestDetails = closestOptional(event.target, 'details')
		if (closestDetails) {
			closestDetails.setAttribute('open', 'true')
		}

		document.body.addEventListener('click', this.onBodyClickEvent)
		document.body.classList.add('overflow-hidden')

		trapFocus(
			qsRequired('[tabindex="-1"]', this.detailsContainer),
			qsOptional('input:not([type="hidden"])', this.detailsContainer)
		)
	}

	close(focusToggle = true) {
		removeTrapFocus(focusToggle ? this.summaryToggle : undefined)
		this.detailsContainer.removeAttribute('open')
		if (this.onBodyClickEvent) {
			document.body.removeEventListener('click', this.onBodyClickEvent)
		}

		document.body.classList.remove('overflow-hidden')
	}
}

customElements.define('details-modal', DetailsModal)
