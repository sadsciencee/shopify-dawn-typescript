import { UcoastEl } from '@/scripts/core/UcoastEl'
import {
	formatPhoneNumber,
	getBackendRoute,
} from '@/scripts/core/global'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { ModalDialog } from '@/scripts/theme/modal-dialog'

type NotifyMeConfigValues = {
	email: string
	variant: string
	phone_number?: string
}

export class WaitlistForm extends UcoastEl {
	static htmlSelector = 'waitlist-form'
	form: HTMLFormElement
	submitButton: HTMLButtonElement
	emailInput: HTMLInputElement
	variantInput: HTMLInputElement
	route: string
	variant?: string
	successMessage: string
	errorMessage: string
	companyId: string
	constructor() {
		super()
		this.form = qsRequired('form', this)
		this.submitButton = qsRequired('[type="submit"]', this)
		this.variantInput = qsRequired('[name="variant"]', this)
		this.emailInput = qsRequired('[type="email"]', this)
		this.route = `${getBackendRoute()}/api/klaviyo-oos`
		this.form.addEventListener('submit', this.onSubmitHandler.bind(this))
		this.successMessage = getAttributeOrThrow('data-success', this)
		this.errorMessage = getAttributeOrThrow('data-error', this)
		this.companyId = getAttributeOrThrow('data-company-id', this)
	}

	onSubmitHandler(event: Event) {
		event.preventDefault()
		if (this.submitButton.getAttribute('aria-disabled') === 'true') return
		if (this.emailInput.value.length < 1) return

		this.submitButton.setAttribute('aria-disabled', 'true')
		this.submitButton.classList.add('loading')

		const formData = new FormData(this.form)

		const config = this.notifyMeConfig(formData)

		fetch(
			`https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${this.companyId}`,
			config
		)
			.then((response) => response.text())
			.then((_) => {
				this.emailInput.value = ''
				this.submitButton.classList.add('success')
				this.emailInput.placeholder = this.successMessage
				window.setTimeout(() => {
					qsRequired<ModalDialog>('#WaitlistModal')?.hide()
				}, 5000)
			})
			.catch((e) => {
				this.emailInput.placeholder = this.errorMessage
				console.error(e)
			})
			.finally(() => {
				this.submitButton.classList.remove('loading')
				this.submitButton.removeAttribute('aria-disabled')
			})
	}
	notifyMeConfig(body: FormData) {
		const data: NotifyMeConfigValues = {
			email: getOrThrow(body, 'email'),
			variant: getOrThrow(body, 'variant'),
		}
		let phone_number = getOrThrow(body, 'phone_number')
		if (phone_number) {
			data.phone_number = formatPhoneNumber(phone_number)
		}
		return {
			method: 'POST',
			mode: 'cors' as RequestMode,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}
	}

}
