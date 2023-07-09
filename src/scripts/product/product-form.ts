import { ATTRIBUTES, PUB_SUB_EVENTS, SELECTORS } from '@/scripts/core/global';
import { addToCartConfig, closestOptional, qsOptional, qsRequired } from '@/scripts/core/global'
import { type CartNotification } from '@/scripts/theme/cart-notification'
import { type CartDrawer } from '@/scripts/cart/cart-drawer'
import { routes, type uCoastWindow } from '@/scripts/setup'
import { publish } from '@/scripts/core/global'
import { QuickAddModal } from '@/scripts/optional/quick-add'
import { UcoastEl } from '@/scripts/core/UcoastEl'

declare let window: uCoastWindow

export class ProductForm extends UcoastEl {
	static htmlSelector = 'product-form'
	static selectors = {
		form: 'form',
		formIdEl: '[name=id]',
		submitButton: '[type="submit"]',
		submitButtonMessage: '[type="submit"] span',
		soldOutMessage: '[data-uc-sold-out-message]',
		errorMessageWrapper: '[data-uc-product-form-error-message-wrapper]',
		errorMessage: '[data-uc-product-form-error-message]',
	}


	form: HTMLFormElement
	formIdEl: HTMLInputElement
	cart?: CartNotification | CartDrawer
	submitButton: HTMLButtonElement
	errorMessageWrapper?: HTMLElement
	errorMessage?: HTMLElement
	hideErrors: boolean
	error?: boolean

	constructor() {
		super()

		this.form = qsRequired(ProductForm.selectors.form, this)
		this.formIdEl = qsRequired(ProductForm.selectors.formIdEl, this.form)
		this.formIdEl.disabled = false
		this.form.addEventListener('submit', this.onSubmitHandler.bind(this))
		this.cart =
			qsOptional<CartNotification>('cart-notification') ||
			qsOptional<CartDrawer>('cart-drawer')
		this.submitButton = qsRequired(ProductForm.selectors.submitButton, this)
		if (this.cart?.localName === 'cart-drawer')
			this.submitButton.setAttribute('aria-haspopup', 'dialog')

		this.hideErrors = this.dataset.hideErrors === 'true'
	}

	getSpinner() {
		return qsRequired(SELECTORS.loadingOverlaySpinner, this)
	}

	onSubmitHandler(event: Event) {
		event.preventDefault()
		if (this.submitButton.getAttribute('aria-disabled') === 'true') return

		this.handleErrorMessage()

		this.submitButton.setAttribute('aria-disabled', 'true')
		this.submitButton.setAttribute(ATTRIBUTES.loading, '')
		this.getSpinner().classList.remove('hidden')

		const formData = new FormData(this.form)
		if (this.cart) {
			const sectionIdsToRender = this.cart
				.getSectionsToRender()
				.filter((section) => section.id)
				.map((section) => section.id)
			if (!sectionIdsToRender.length) throw Error('getSectionsToRender returned empty array')
			formData.append('sections', sectionIdsToRender.join(','))
			formData.append('sections_url', window.location.pathname)
			if (!(document.activeElement instanceof HTMLElement)) throw Error('no activeElement')
			this.cart.setActiveElement(document.activeElement)
		}
		const config = addToCartConfig(formData)
		const addedVariantId = formData.get('id') as string
		if (!addedVariantId) throw Error('No variant id found')

		fetch(`${routes.cart_add_url}`, config)
			.then((response) => response.json())
			.then((response) => {
				if (response.status) {
					publish(PUB_SUB_EVENTS.cartError, {
						source: 'product-form',
						productVariantId: addedVariantId,
						errors: response.errors || response.description,
						message: response.message,
					})
					this.handleErrorMessage(response.description)

					const soldOutMessage = this.submitButton.querySelector(ProductForm.selectors.soldOutMessage)
					if (!soldOutMessage) return
					this.submitButton.setAttribute('aria-disabled', 'true')
					const submitButtonText = qsRequired(ProductForm.selectors.submitButtonMessage, this.submitButton)
					submitButtonText.classList.add('hidden')
					soldOutMessage.classList.remove('hidden')
					this.error = true
					return
				} else if (!this.cart) {
					window.location = window.routes.cart_url
					return
				}

				if (!this.error)
					publish(PUB_SUB_EVENTS.cartUpdate, {
						source: 'product-form',
						productVariantId: addedVariantId,
					})
				this.error = false
				const quickAddModal = closestOptional<QuickAddModal>(this, 'quick-add-modal')
				if (quickAddModal) {
					document.body.addEventListener(
						'modalClosed',
						() => {
							setTimeout(() => {
								if (this.cart) {
									this.cart.renderContents(response)
								}
							})
						},
						{ once: true }
					)
					quickAddModal.hide(true)
				} else {
					this.cart.renderContents(response)
				}
			})
			.catch((e) => {
				console.error(e)
			})
			.finally(() => {
				this.submitButton.removeAttribute(ATTRIBUTES.loading)
				this.cart?.hasAttribute(ATTRIBUTES.cartEmpty) &&
					this.cart.removeAttribute(ATTRIBUTES.cartEmpty)

				if (!this.error) this.submitButton.removeAttribute('aria-disabled')
				this.getSpinner().classList.add('hidden')
			})
	}

	handleErrorMessage(errorMessage?: string) {
		if (this.hideErrors) return

		this.errorMessageWrapper =
			this.errorMessageWrapper || qsRequired(ProductForm.selectors.errorMessageWrapper, this)
		if (!this.errorMessageWrapper) throw new Error('No error message wrapper found')
		this.errorMessage =
			this.errorMessage ||
			qsRequired(ProductForm.selectors.errorMessage, this.errorMessageWrapper)

		this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage)

		if (errorMessage) {
			this.errorMessage.textContent = errorMessage
		}
	}
}
