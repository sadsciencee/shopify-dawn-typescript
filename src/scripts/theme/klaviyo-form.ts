import { UcoastEl } from '@/scripts/core/UcoastEl'
import {
	addToKlaviyoListConfig,
	getBackendRoute,
	qsOptional,
	qsRequired,
} from '@/scripts/core/global'
import { type WelcomePopup } from '@/scripts/theme/welcome-popup'

export class KlaviyoForm extends UcoastEl {
	static htmlSelector = 'klaviyo-form'
	form: HTMLFormElement
	submitButton: HTMLButtonElement
	emailInput: HTMLInputElement
	successMessage: string
	route: string
	popup?: WelcomePopup
	termsElements?: {
		termsAccepted: HTMLButtonElement
		termsLabel: HTMLLabelElement
	}
	termsAccepted = true

	constructor() {
		super()
		this.form = qsRequired('form', this)
		this.submitButton = qsRequired('[type="submit"]', this)
		this.emailInput = qsRequired('[type="email"]', this)
		this.successMessage = this.getSuccessMessage()
		this.route = `${getBackendRoute()}/api/klaviyo-list`
		this.form.addEventListener('submit', this.onSubmitHandler.bind(this))
		this.popup = qsOptional<WelcomePopup>('welcome-popup')
		this.termsElements = this.getTermsElements()
		this.termsSetup()
	}

	getTermsElements() {
		const termsAccepted = qsOptional<HTMLButtonElement>(
			'button[data-terms-accepted]',
			this
		)
		const termsLabel = qsOptional<HTMLLabelElement>(
			'[data-terms-label]',
			this
		)
		if (termsAccepted && termsLabel) {
			return {
				termsAccepted,
				termsLabel,
			}
		}
		return undefined
	}

	termsSetup() {
		if (!this.termsElements) return
		this.termsAccepted = false
		this.termsElements.termsAccepted.addEventListener(
			'click',
			this.toggleTerms.bind(this)
		)
		this.termsElements.termsLabel.addEventListener(
			'click',
			this.toggleTerms.bind(this)
		)
	}

	toggleTerms() {
		if (!this.termsElements) throw new Error('Terms elements not found')
		if (this.termsAccepted) {
			this.termsAccepted = false
			this.termsElements.termsAccepted.classList.remove('active')
			this.submitButton.setAttribute('disabled', '')
		} else {
			this.termsElements.termsAccepted.classList.add('active')
			this.submitButton.removeAttribute('disabled')
			this.termsAccepted = true
		}
	}

	getSuccessMessage(): string {
		const message = this.form.getAttribute('data-success')
		return message ?? 'Thank You'
	}

	onSubmitHandler(event: Event) {
		event.preventDefault()
		if (this.submitButton.getAttribute('aria-disabled') === 'true') return
		if (this.emailInput.value.length < 1) return

		this.submitButton.setAttribute('aria-disabled', 'true')
		this.submitButton.classList.add('loading')

		const formData = new FormData(this.form)

		const config = addToKlaviyoListConfig(formData)

		fetch(this.route, config)
			.then((response) => response.json())
			.then((response) => {
				this.emailInput.value = ''
				if (response.success) {
					this.emailInput.placeholder = this.successMessage
					if (this.popup) {
						window.setTimeout(() => {
							this.popup?.hide()
						}, 1000)
					}
				} else {
					this.emailInput.placeholder =
						'This email address is invalid.'
				}
			})
			.catch((e) => {
				console.error(e)
			})
			.finally(() => {
				this.submitButton.classList.remove('loading')
				this.submitButton.removeAttribute('aria-disabled')
			})
	}
}
