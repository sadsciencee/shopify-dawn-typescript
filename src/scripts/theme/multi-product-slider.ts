import { TsDOM as q } from '@/scripts/core/TsDOM'
import { UcoastEl } from '@/scripts/core/UcoastEl'
import { ProductSlider } from '@/scripts/theme/product-slider'

export class MultiProductSlider extends UcoastEl {
	static htmlSelector = 'multi-product-slider'
	navButtons: NodeListOf<HTMLButtonElement>
	sliderWrappers: NodeListOf<HTMLElement>
	sliders: NodeListOf<ProductSlider>
	constructor() {
		super()
		this.navButtons = qsaRequired('button[data-nav]', this)
		this.sliderWrappers = qsaRequired('[data-slider]', this)
		this.sliders = qsaRequired(ProductSlider.htmlSelector, this)
		this.addListeners()
	}

	addListeners() {
		this.navButtons.forEach((button) => {
			button.addEventListener('click', this.activateSlider.bind(this))
		})
	}

	activateSlider(event: Event) {
		const currentTarget = currentTargetRequired(event)
		const blockId = getAttributeOrThrow('data-nav', currentTarget)
		this.navButtons.forEach((navButton) => {
			const navBlockId = getAttributeOrThrow('data-nav', navButton)
			if (blockId === navBlockId) {
				navButton.classList.add('active')
			} else {
				navButton.classList.remove('active')
			}
		})
		this.sliderWrappers.forEach((sliderWrapper) => {
			const sliderBlockId = getAttributeOrThrow(
				'data-slider',
				sliderWrapper
			)
			if (blockId === sliderBlockId) {
				sliderWrapper.classList.add('active')
			} else {
				sliderWrapper.classList.remove('active')
			}
		})
	}
}
