import { UcoastEl } from '@/scripts/core/UcoastEl';
import { currentTargetRequired, getAttributeOrThrow } from '@/scripts/functions';

export class PriceRange extends UcoastEl {
  static htmlSelector = 'price-range'
  constructor() {
    super()
    this.querySelectorAll('input').forEach((element) =>
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
    const inputs = this.querySelectorAll('input')
    const minInput = inputs[0]
    const maxInput = inputs[1]
    if (maxInput.value) minInput.setAttribute('max', maxInput.value)
    if (minInput.value) maxInput.setAttribute('min', minInput.value)
    if (minInput.value === '') maxInput.setAttribute('min', '0')
    if (maxInput.value === '')
      minInput.setAttribute('max', getAttributeOrThrow('max', maxInput))
  }

  adjustToValidValues(input: HTMLInputElement) {
    const value = Number(input.value)
    const min = Number(getAttributeOrThrow('min', input))
    const max = Number(getAttributeOrThrow('max', input))

    if (value < min) input.value = `${min}`
    if (value > max) input.value = `${max}`
  }
}
