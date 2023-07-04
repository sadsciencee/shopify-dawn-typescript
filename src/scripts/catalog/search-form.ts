import { qsRequired } from '@/scripts/functions'

export class SearchForm extends HTMLElement {
	input: HTMLInputElement
  resetButton: HTMLButtonElement
	form: HTMLFormElement
	constructor() {
		super()
		this.input = qsRequired('input[type="search"]', this)
		const form = this.input.form
		if (!form) throw new Error('input is not in a form element')
		this.form = form
		this.resetButton = qsRequired('button[type="reset"]', this)

		this.form.addEventListener('reset', this.onFormReset.bind(this))
		this.input.addEventListener(
			'input',
			debounce((_event: Event) => {
				this.onChange()
			}, 300).bind(this)
		)
	}

	toggleResetButton() {
		const resetIsHidden = this.resetButton.classList.contains('hidden')
		if (this.input.value.length > 0 && resetIsHidden) {
			this.resetButton.classList.remove('hidden')
		} else if (this.input.value.length === 0 && !resetIsHidden) {
			this.resetButton.classList.add('hidden')
		}
	}

	onChange() {
		this.toggleResetButton()
	}

	shouldResetForm() {
		return !document.querySelector('[aria-selected="true"] a')
	}

	onFormReset(event:Event) {
		// Prevent default so the form reset doesn't set the value gotten from the url on page load
		event.preventDefault()
		// Don't reset if the user has selected an element on the predictive search dropdown
		if (this.shouldResetForm()) {
			this.input.value = ''
			this.input.focus()
			this.toggleResetButton()
		}
	}
}

customElements.define('search-form', SearchForm)
