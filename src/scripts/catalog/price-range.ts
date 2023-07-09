import { UcoastEl } from '@/scripts/core/UcoastEl'
import {
	currentTargetRequired,
	getAttributeOrThrow,
	qsaRequired,
	qsRequired,
} from '@/scripts/core/global'

export class PriceRange extends UcoastEl {
	static htmlSelector = 'price-range'
	static selectors = {
		input: '[data-uc-price-range-input]',
		max: '[data-uc-price-range-input="max"]',
		min: '[data-uc-price-range-input="min"]',
	}
	inputs: NodeListOf<HTMLInputElement>
	maxInput: HTMLInputElement
	minInput: HTMLInputElement
	constructor() {
		super()
		this.maxInput = qsRequired(PriceRange.selectors.max, this)
		this.minInput = qsRequired(PriceRange.selectors.min, this)
		this.inputs = qsaRequired(PriceRange.selectors.input, this)
		this.inputs.forEach((element) =>
			element.addEventListener('change', this.onRangeChange.bind(this))
		)
		this.setMinAndMaxValues()
	}

	onRangeChange(event: Event) {
		const currentTarget = currentTargetRequired<Event, HTMLInputElement>(event)
		this.adjustToValidValues(currentTarget)
		this.setMinAndMaxValues()
	}

	setMinAndMaxValues() {
		if (this.maxInput.value) this.minInput.setAttribute('max', this.maxInput.value)
		if (this.minInput.value) this.maxInput.setAttribute('min', this.minInput.value)
		if (this.minInput.value === '') this.maxInput.setAttribute('min', '0')
		if (this.maxInput.value === '')
			this.minInput.setAttribute('max', getAttributeOrThrow('max', this.maxInput))
	}

	adjustToValidValues(input: HTMLInputElement) {
		const value = Number(input.value)
		const min = Number(getAttributeOrThrow('min', input))
		const max = Number(getAttributeOrThrow('max', input))

		if (value < min) input.value = `${min}`
		if (value > max) input.value = `${max}`
	}
}
