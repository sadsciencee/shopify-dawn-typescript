import { UcoastEl } from '@/scripts/core/UcoastEl'
import { TsDOM as q } from '@/scripts/core/TsDOM'

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
		this.maxInput = q.rs(PriceRange.selectors.max, this)
		this.minInput = q.rs(PriceRange.selectors.min, this)
		this.inputs = q.rl(PriceRange.selectors.input, this)
		this.inputs.forEach((element) =>
			element.addEventListener('change', this.onRangeChange.bind(this))
		)
		this.setMinAndMaxValues()
	}

	onRangeChange(event: Event) {
		const currentTarget = q.rct<Event, HTMLInputElement>(event)
		this.adjustToValidValues(currentTarget)
		this.setMinAndMaxValues()
	}

	setMinAndMaxValues() {
		if (this.maxInput.value) this.minInput.setAttribute('max', this.maxInput.value)
		if (this.minInput.value) this.maxInput.setAttribute('min', this.minInput.value)
		if (this.minInput.value === '') this.maxInput.setAttribute('min', '0')
		if (this.maxInput.value === '')
			this.minInput.setAttribute('max', q.ra(this.maxInput, 'max'))
	}

	adjustToValidValues(input: HTMLInputElement) {
		const value = Number(input.value)
		const min = Number(q.ra(input, 'min'))
		const max = Number(q.ra(input, 'max'))

		if (value < min) input.value = `${min}`
		if (value > max) input.value = `${max}`
	}
}
