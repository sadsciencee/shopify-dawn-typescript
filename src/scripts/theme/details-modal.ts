import { TsDOM as q } from '@/scripts/core/TsDOM'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class DetailsModal extends UcoastEl {
	static htmlSelector = 'details-modal'
	detailsContainer: HTMLDetailsElement
	summaryToggle: HTMLElement
	button: HTMLButtonElement
	onBodyClickEvent?: (event: MouseEvent) => undefined
	constructor() {
		super()
		this.detailsContainer = q.rs('details', this)
		this.summaryToggle = q.rs('summary', this)
		this.button = q.rs('button[type="button"]', this)

		this.detailsContainer.addEventListener(
			'keyup',
			(event) => event.code?.toUpperCase() === 'ESCAPE' && this.close()
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
		const closestDetails = q.oClosestTarget(event, 'details')
		closestDetails?.hasAttribute('open')
			? this.close()
			: this.open({
					target: q.rt(event),
			  })
	}

	onBodyClick(event: MouseEvent) {
		const target = q.rt(event)
		if (!this.contains(target) || target.classList.contains('modal-overlay')) this.close(false)
	}

	open(event: { target: HTMLElement }) {
		this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this)
		if (!this.onBodyClickEvent) throw new Error('onBodyClickEvent is undefined')
		const closestDetails = q.oc(event.target, 'details')
		if (closestDetails) {
			closestDetails.setAttribute('open', 'true')
		}

		document.body.addEventListener('click', this.onBodyClickEvent)
		document.body.classList.add('overflow-hidden')

		window.TsDOM.trapFocus(
			q.rs('[tabindex="-1"]', this.detailsContainer),
			q.os('input:not([type="hidden"])', this.detailsContainer)
		)
	}

	close(focusToggle = true) {
		window.TsDOM.removeTrapFocus(focusToggle ? this.summaryToggle : undefined)
		this.detailsContainer.removeAttribute('open')
		if (this.onBodyClickEvent) {
			document.body.removeEventListener('click', this.onBodyClickEvent)
		}

		document.body.classList.remove('overflow-hidden')
	}
}

customElements.define('details-modal', DetailsModal)
