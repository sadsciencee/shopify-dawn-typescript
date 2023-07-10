import { PUB_SUB_EVENTS } from '@/scripts/core/global'
import { subscribe, type SubscriberCallback } from '@/scripts/core/global'
import { qsRequired, targetRequired } from '@/scripts/core/global'
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class QuantityInput extends UcoastEl {
	static htmlSelector = 'quantity-input'
	input: HTMLInputElement
	changeEvent: Event
	quantityUpdateUnsubscriber: SubscriberCallback | undefined = undefined
	constructor() {
		super()
		this.input = qsRequired('input', this)
		this.changeEvent = new Event('change', { bubbles: true })

		this.input.addEventListener('change', this.onInputChange.bind(this))
		this.querySelectorAll('button').forEach((button) =>
			button.addEventListener('click', this.onButtonClick.bind(this))
		)
	}

	override connectedCallback() {
		this.validateQtyRules()
		this.quantityUpdateUnsubscriber = subscribe(
			PUB_SUB_EVENTS.quantityUpdate,
			this.validateQtyRules.bind(this)
		)
	}

	override disconnectedCallback() {
		if (this.quantityUpdateUnsubscriber) {
			this.quantityUpdateUnsubscriber(undefined)
		}
	}

	onInputChange(_event: Event) {
		this.validateQtyRules()
	}

	onButtonClick(event: Event) {
		event.preventDefault()
		const previousValue = this.input.value
		const target = targetRequired<Event, HTMLButtonElement>(event)

		target.name === 'plus' ? this.input.stepUp() : this.input.stepDown()
		if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent)
	}

	validateQtyRules() {
		const value = parseInt(this.input.value)
		if (this.input.min) {
			const min = parseInt(this.input.min)
			const buttonMinus = qsRequired(".quantity__button[name='minus']", this)
			buttonMinus.classList.toggle('disabled', value <= min)
		}
		if (this.input.max) {
			const max = parseInt(this.input.max)
			const buttonPlus = qsRequired(".quantity__button[name='plus']", this)
			buttonPlus.classList.toggle('disabled', value >= max)
		}
	}
}
