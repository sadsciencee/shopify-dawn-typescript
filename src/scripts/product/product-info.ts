import { PUB_SUB_EVENTS } from '@/scripts/core/global'
import { isVariantChangeEvent, publish, subscribe } from '@/scripts/core/global'
import { type VariantRadios } from '@/scripts/product/variant-radios'
import { getAttributeOrThrow, qsOptional, qsRequired } from '@/scripts/core/global'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class ProductInfo extends UcoastEl {
	static htmlSelector = 'product-info'
	static selectors = {
		quantityForm: '[data-uc-product-form-quantity]',
		quantityInput: '[data-uc-quantity-input]',
		quantityRules: '[data-uc-quantity-rules]',
		quantityRulesCart: '[data-uc-quantity-rules-cart]',
		quantityLabel: '[data-uc-quantity-label]',
		currentVariant: '[data-uc-product-variant-id]',
		variantSelects: 'variant-radios, variant-selects',
		submitButton: '[type="submit"]',
	}
	input: HTMLInputElement
	currentVariant: HTMLInputElement
	variantSelects?: VariantRadios
	submitButton: HTMLButtonElement
	quantityForm?: HTMLFormElement
	cartUpdateUnsubscriber?: () => void = undefined
	variantChangeUnsubscriber?: () => void = undefined

	constructor() {
		super()
		this.input = qsRequired(ProductInfo.selectors.quantityInput, this)
		this.currentVariant = qsRequired(ProductInfo.selectors.currentVariant, this)
		this.variantSelects = qsOptional(ProductInfo.selectors.variantSelects, this)
		this.submitButton = qsRequired(ProductInfo.selectors.submitButton, this)
	}

	override connectedCallback() {
		if (!this.input) return
		this.quantityForm = qsOptional(ProductInfo.selectors.quantityForm, this)
		if (!this.quantityForm) return
		this.setQuantityBoundries()
		if (!this.dataset.originalSection) {
			this.cartUpdateUnsubscriber = subscribe(
				PUB_SUB_EVENTS.cartUpdate,
				this.fetchQuantityRules.bind(this)
			)
		}
		this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
			if (!isVariantChangeEvent(event)) return
			const sectionId = this.dataset.originalSection
				? this.dataset.originalSection
				: this.dataset.section
			if (event.data.sectionId !== sectionId) return
			this.updateQuantityRules(event.data.sectionId, event.data.html)
			this.setQuantityBoundries()
		})
	}

	override disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber()
		}
		if (this.variantChangeUnsubscriber) {
			this.variantChangeUnsubscriber()
		}
	}

	setQuantityBoundries() {
		const data = {
			cartQuantity: this.input.dataset.cartQuantity
				? parseInt(this.input.dataset.cartQuantity)
				: 0,
			min: this.input.dataset.min ? parseInt(this.input.dataset.min) : 1,
			max: this.input.dataset.max ? parseInt(this.input.dataset.max) : null,
			step: this.input.step ? parseInt(this.input.step) : 1,
		}

		let min = data.min
		const max = data.max === null ? data.max : data.max - data.cartQuantity
		if (max !== null) min = Math.min(min, max)
		if (data.cartQuantity >= data.min) min = Math.min(min, data.step)

		this.input.min = `${min}`
		this.input.max = `${max}`
		this.input.value = `${min}`
		publish(PUB_SUB_EVENTS.quantityUpdate, undefined)
	}

	fetchQuantityRules() {
		if (!this.currentVariant || !this.currentVariant.value) return
		qsRequired('[data-uc-quantity-rules-cart] [data-uc-loading-overlay]', this).classList.remove('hidden')
		fetch(
			`${this.dataset.url}?variant=${this.currentVariant.value}&section_id=${this.dataset.section}`
		)
			.then((response) => {
				return response.text()
			})
			.then((responseText) => {
				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const sectionId = getAttributeOrThrow('data-section', this)
				this.updateQuantityRules(sectionId, html)
				this.setQuantityBoundries()
			})
			.catch((e) => {
				console.error(e)
			})
			.finally(() => {
				qsRequired('[data-uc-quantity-rules-cart] [data-uc-loading-overlay]', this).classList.add('hidden')
			})
	}

	updateQuantityRules(sectionId: string, html: Document) {
		const quantityFormUpdated = html.getElementById(`Quantity-Form-${sectionId}`)
		const selectors = [
			ProductInfo.selectors.quantityInput,
			ProductInfo.selectors.quantityRules,
			ProductInfo.selectors.quantityLabel,
		]
		for (let selector of selectors) {
			if (!quantityFormUpdated) continue
			const current = qsOptional(selector, this.quantityForm)
			const updated = qsOptional(selector, quantityFormUpdated)
			if (!current || !updated) continue
			if (selector === ProductInfo.selectors.quantityInput) {
				const attributes = ['data-cart-quantity', 'data-min', 'data-max', 'step']
				for (let attribute of attributes) {
					const valueUpdated = updated.getAttribute(attribute)
					if (valueUpdated !== null) current.setAttribute(attribute, valueUpdated)
				}
			} else {
				current.innerHTML = updated.innerHTML
			}
		}
	}
}
