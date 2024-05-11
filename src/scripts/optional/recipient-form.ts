import { PUB_SUB_EVENTS } from '@/scripts/core/global'
import {
	isCartErrorEvent,
	isCartUpdateEvent,
	isVariantChangeEvent,
	subscribe,
} from '@/scripts/core/global'
import { getAttributeOrThrow, qsaOptional, qsOptional, qsRequired } from '@/scripts/core/global';
import { UcoastEl } from '@/scripts/core/UcoastEl';

export class RecipientForm extends UcoastEl {
	static htmlSelector = 'recipient-form'
	sectionId: string
	recipientFieldsLiveRegion: HTMLElement
	checkboxInput: HTMLInputElement
	hiddenControlField: HTMLInputElement
	emailInput: HTMLInputElement
	nameInput: HTMLInputElement
	messageInput: HTMLInputElement
	sendonInput: HTMLInputElement
	offsetProperty?: HTMLInputElement
	errorMessageWrapper?: HTMLElement
	errorMessageList?: HTMLElement
	errorMessage?: HTMLElement
	currentProductVariantId: string
	defaultErrorHeader?: string
	// from native dawn constructor
	cartUpdateUnsubscriber?: () => void = undefined
	variantChangeUnsubscriber?: () => void = undefined
	cartErrorUnsubscriber?: () => void = undefined
	constructor() {
		super()
		const sectionId = this.dataset.sectionId
		if (!sectionId) throw new Error('RecipientForm: missing data-section-id')
		this.sectionId = sectionId
		this.recipientFieldsLiveRegion = qsRequired(
			`#Recipient-fields-live-region-${this.sectionId}`,
			this
		)
		this.checkboxInput = qsRequired(`#Recipient-checkbox-${this.sectionId}`, this)
		this.checkboxInput.disabled = false
		this.hiddenControlField = qsRequired(`#Recipient-control-${this.sectionId}`, this)
		this.hiddenControlField.disabled = true
		this.emailInput = qsRequired(`#Recipient-email-${this.sectionId}`, this)
		this.nameInput = qsRequired(`#Recipient-name-${this.sectionId}`, this)
		this.messageInput = qsRequired(`#Recipient-message-${this.sectionId}`, this)
		this.sendonInput = qsRequired(`#Recipient-send-on-${this.sectionId}`, this)
		this.offsetProperty = qsOptional(`#Recipient-timezone-offset-${this.sectionId}`, this)
		if (this.offsetProperty)
			this.offsetProperty.value = new Date().getTimezoneOffset().toString()

		this.errorMessageWrapper = qsOptional('.product-form__recipient-error-message-wrapper')
		if (this.errorMessageWrapper instanceof HTMLElement) {
			this.errorMessageList = qsRequired('ul', this.errorMessageWrapper)
			this.errorMessage = qsRequired('.error-message', this.errorMessageWrapper)
			this.defaultErrorHeader = this.errorMessage.innerText
		} else {
			console.warn('RecipientForm: missing error message wrapper')
		}
		this.currentProductVariantId = getAttributeOrThrow('product-variant-id', this)
		this.addEventListener('change', this.onChange.bind(this))
		this.onChange()
	}

	override connectedCallback() {
		this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
			if (!isCartUpdateEvent(event)) return
			if (
				event &&
				event.source === 'product-form' &&
				event.productVariantId?.toString() === this.currentProductVariantId
			) {
				this.resetRecipientForm()
			}
		})

		this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
			if (!isVariantChangeEvent(event)) return
			if (event && event.data && event.data.sectionId === this.sectionId) {
				this.currentProductVariantId = event.data.variant.id.toString()
			}
		})

		this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartError, (event) => {
			if (!isCartErrorEvent(event)) return
			if (
				event.source === 'product-form' &&
				event.productVariantId.toString() === this.currentProductVariantId
			) {
				this.displayErrorMessage(event.message, event.errors)
			}
		})
	}

	override disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber()
		}

		if (this.variantChangeUnsubscriber) {
			this.variantChangeUnsubscriber()
		}

		if (this.cartErrorUnsubscriber) {
			this.cartErrorUnsubscriber()
		}
	}

	onChange() {
		if (this.checkboxInput.checked) {
			this.enableInputFields()
			this.recipientFieldsLiveRegion.innerText =
				window.accessibilityStrings.recipientFormExpanded
		} else {
			this.clearInputFields()
			this.disableInputFields()
			this.clearErrorMessage()
			this.recipientFieldsLiveRegion.innerText =
				window.accessibilityStrings.recipientFormCollapsed
		}
	}

	inputFields(): HTMLInputElement[] {
		return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput]
	}

	disableableFields(): HTMLInputElement[] {
		return this.offsetProperty
			? [...this.inputFields(), this.offsetProperty]
			: this.inputFields()
	}

	clearInputFields() {
		this.inputFields().forEach((field) => (field.value = ''))
	}

	enableInputFields() {
		this.disableableFields().forEach((field) => (field.disabled = false))
	}

	disableInputFields() {
		this.disableableFields().forEach((field) => (field.disabled = true))
	}

	displayErrorMessage(_title: string, body: string | string[] | { [key: string]: string[] }) {
		this.clearErrorMessage()
		if (!this.errorMessageWrapper)
			throw new Error(
				'RecipientForm: displayErrorMessage called too early, missing error message wrapper'
			)
		this.errorMessageWrapper.hidden = false
		if (typeof body === 'object') {
			if (!(this.errorMessage instanceof HTMLElement))
				throw new Error(
					'RecipientForm: displayErrorMessage called too early, missing error message'
				)
			this.errorMessage.innerText = this.defaultErrorHeader ?? 'Error'
			return Object.entries(body).forEach(([key, value]) => {
				const errorMessageId = `RecipientForm-${key}-error-${this.sectionId}`
				const fieldSelector = `#Recipient-${key}-${this.sectionId}`
				const message = `${value.join(', ')}`
				const errorMessageElement = qsRequired(`#${errorMessageId}`, this)
				const errorTextElement = qsRequired('.error-message', errorMessageElement)

				if (this.errorMessageList) {
					this.errorMessageList.appendChild(
						this.createErrorListItem(fieldSelector, message)
					)
				}

				errorTextElement.innerText = `${message}.`
				errorMessageElement.classList.remove('hidden')

				const inputElement = this.getInputElement(key)
				if (!inputElement) return

				inputElement.setAttribute('aria-invalid', 'true')
				inputElement.setAttribute('aria-describedby', errorMessageId)
			})
		}

		if (!(this.errorMessage instanceof HTMLElement))
			throw new Error('Missing this.errorMessage, cannot display error')
		this.errorMessage.innerText = body
	}

	getInputElement(key: string): HTMLInputElement {
		switch (key) {
			case 'email':
				return this.emailInput
			case 'name':
				return this.nameInput
			case 'message':
				return this.messageInput
			case 'sendon':
				return this.sendonInput
			case 'checkbox':
				return this.checkboxInput
		}
		throw new Error(`RecipientForm: unknown input element ${key}`)
	}

	createErrorListItem(target:string, message:string) {
		const li = document.createElement('li')
		const a = document.createElement('a')
		a.setAttribute('href', target)
		a.innerText = message
		li.appendChild(a)
		li.className = 'error-message'
		return li
	}

	clearErrorMessage() {
		if (!this.errorMessageWrapper) throw new Error('Missing this.errorMessageWrapper, cannot clearErrorMessage')
		this.errorMessageWrapper.hidden = true

		if (this.errorMessageList) this.errorMessageList.innerHTML = ''

		const errorMessages = qsaOptional('.recipient-fields .form__message', this)
		if (errorMessages) {
			errorMessages.forEach((field) => {
				field.classList.add('hidden')
				const textField = qsOptional('.error-message', field)
				if (textField) textField.innerText = ''
			})
		}


		;[this.emailInput, this.messageInput, this.nameInput, this.sendonInput].forEach(
			(inputElement) => {
				inputElement.setAttribute('aria-invalid', 'false')
				inputElement.removeAttribute('aria-describedby')
			}
		)
	}

	resetRecipientForm() {
		if (this.checkboxInput.checked) {
			this.checkboxInput.checked = false
			this.clearInputFields()
			this.clearErrorMessage()
		}
	}
}
