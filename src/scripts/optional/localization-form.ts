import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type EventWithRelatedTarget } from '@/scripts/types/theme'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class LocalizationForm extends UcoastEl {
	static htmlSelector = 'localization-form'
	static selectors = {
		input: 'input[name="locale_code"], input[name="country_code"]',
		button: '[data-uc-localization-button]',
		panel: '[data-uc-localization-wrapper]',
		target: '[data-uc-localization-target]',
	}
	elements: {
		input: HTMLInputElement
		button: HTMLButtonElement
		panel: HTMLElement
	}
	constructor() {
		super()
		this.elements = {
			input: q.rs(LocalizationForm.selectors.input, this),
			button: q.rs(LocalizationForm.selectors.button, this),
			panel: q.rs(LocalizationForm.selectors.panel, this),
		}
		this.elements.button.addEventListener(
			'click',
			this.openSelector.bind(this)
		)
		this.elements.button.addEventListener(
			'focusout',
			this.closeSelector.bind(this)
		)
		this.addEventListener('keyup', this.onContainerKeyUp.bind(this))

		this.querySelectorAll(LocalizationForm.selectors.target).forEach(
			(item) =>
				item.addEventListener('click', this.onItemClick.bind(this))
		)
	}

	hidePanel() {
		this.elements.button.setAttribute('aria-expanded', 'false')
		this.elements.panel.setAttribute('hidden', 'true')
	}

	onContainerKeyUp(event: KeyboardEvent) {
		if (event.code?.toUpperCase() !== 'ESCAPE') return

		if (this.elements.button.getAttribute('aria-expanded') == 'false')
			return
		this.hidePanel()
		event.stopPropagation()
		this.elements.button.focus()
	}

	onItemClick(event: MouseEvent) {
		event.preventDefault()
		const form = this.querySelector('form')
		this.elements.input.value =
			q.rct(event).dataset.value ?? this.elements.input.value
		if (form) form.submit()
	}

	openSelector() {
		this.elements.button.focus()
		this.elements.panel.toggleAttribute('hidden')
		this.elements.button.setAttribute(
			'aria-expanded',
			(
				this.elements.button.getAttribute('aria-expanded') === 'false'
			).toString()
		)
	}

	closeSelector(event: EventWithRelatedTarget) {
		const rt = q.ort(event)
		const isChild =
			(rt && this.elements.panel.contains(rt)) ||
			(rt && this.elements.button.contains(rt))
		if (!event.relatedTarget || !isChild) {
			this.hidePanel()
		}
	}
}
