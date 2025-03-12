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
		this.navButtons = q.rl('button[data-nav]', this)
		this.sliderWrappers = q.rl('[data-slider]', this)
		this.sliders = q.rl(ProductSlider.htmlSelector, this)
		this.addListeners()
	}

	addListeners() {
		this.navButtons.forEach((button) => {
			button.addEventListener('click', this.activateSlider.bind(this))
		})
	}

	activateSlider(event: Event) {
		const currentTarget = q.rct(event)
		const blockId = q.ra(currentTarget, 'data-nav')
		this.navButtons.forEach((navButton) => {
			const navBlockId = q.ra(navButton, 'data-nav')
			if (blockId === navBlockId) {
				navButton.classList.add('active')
				navButton.classList.remove('underline-on-hover')
				navButton.classList.add('underline-always')
			} else {
				navButton.classList.remove('active')
				navButton.classList.add('underline-on-hover')
				navButton.classList.remove('underline-always')
			}
		})
		this.sliderWrappers.forEach((sliderWrapper) => {
			const sliderBlockId = q.ra(sliderWrapper, 'data-slider')
			if (blockId === sliderBlockId) {
				sliderWrapper.classList.add('active')
				void window.Ucoast.mediaManager.playAllInContainer(
					sliderWrapper
				)
			} else {
				sliderWrapper.classList.remove('active')
				void window.Ucoast.mediaManager.pauseAllInContainer(
					sliderWrapper
				)
			}
		})
	}
}
