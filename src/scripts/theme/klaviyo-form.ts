import { UcoastEl } from '@/scripts/core/UcoastEl'
import {
	formatPhoneNumber,
} from '@/scripts/core/global'
import { TsDOM as q } from '@/scripts/core/TsDOM'
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
	companyId: string

	constructor() {
		super()
		this.form = q.rs('form', this)
		this.submitButton = q.rs('[type="submit"]', this)
		this.emailInput = q.rs('[type="email"]', this)
		this.successMessage = this.getSuccessMessage()
		this.form.addEventListener('submit', this.onSubmitHandler.bind(this))
		this.popup = q.os<WelcomePopup>('welcome-popup')
		this.termsElements = this.getTermsElements()
		this.termsSetup()
		this.companyId = q.ra(this, 'data-company-id')
		this.route = `https://a.klaviyo.com/client/subscriptions/?company_id=${this.companyId}`
	}

	getTermsElements() {
		const termsAccepted = q.os<HTMLButtonElement>(
			'button[data-terms-accepted]',
			this
		)
		const termsLabel = q.os<HTMLLabelElement>(
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

		const config = this.addToKlaviyoListConfig(formData)

		fetch(this.route, config)
			.then((response) => response.text())
			.then((response) => {
				this.emailInput.value = ''
				if (response && response?.length > 0) {
					this.emailInput.placeholder =
						'This email address is invalid.'
				} else {
					this.emailInput.placeholder = this.successMessage
					if (this.popup) {
						window.setTimeout(() => {
							this.popup?.hide()
						}, 1000)
					}
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

	addToKlaviyoListConfig(body: FormData) {
		const values = {
			email: q.rfd(body, 'email'),
			list_id: q.rfd(body, 'list_id'),
			custom_source: q.rfd(body,'custom_source'),
			phone_number: q.ofd(body, 'phone_number'),
			language_iso: q.ofd(body, 'language_iso') ?? 'en',
			market_handle: q.ofd(body, 'market_handle') ?? 'us'
		}
		if (values.phone_number) {
			values.phone_number = formatPhoneNumber(values.phone_number)
		}
		const data ={
			data: {
				type: "subscription",
				attributes: {
					custom_source: values.custom_source,
					profile: {
						data: {
							type: "profile",
							attributes: {
								email: values.email,
								phone_number: values.phone_number,
								properties: {
									language_iso: values.language_iso,
									market_handle: values.market_handle,
								}
							},
						}
					}
				},
				relationships: {
					list: {
						data: {
							type: "list",
							id: values.list_id
						}
					}
				}
			}
		}
		return {
			method: 'POST',
			mode: 'cors' as RequestMode,
			headers: {
				'Content-Type': 'application/json',
				'Revision': '2024-05-15'
			},
			body: JSON.stringify(data),
		}
	}
}
