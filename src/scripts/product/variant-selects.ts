import { PUB_SUB_EVENTS } from '@/scripts/core/global'
import { createVariantChangeEvent, publish } from '@/scripts/core/global'
import {
	getAttributeOrThrow,
	qsaOptional,
	qsaRequired,
	qsOptional,
	qsRequired,
} from '@/scripts/core/global'
import { type ProductVariant } from '@/scripts/types/api'
import { type uCoastWindow } from '@/scripts/setup'
import { type ProductForm } from '@/scripts/product/product-form'
import { type MediaGallery } from '@/scripts/product/media-gallery'
import { type ShareButton } from '@/scripts/optional/share-button'
import { type PickupAvailability } from '@/scripts/optional/pickup-availability'
import { UcoastEl } from '@/scripts/core/UcoastEl';

declare let window: uCoastWindow

export class VariantSelects extends UcoastEl {
	static htmlSelector = 'variant-selects'
	static selectors = {

	}
	instanceSelectors = VariantSelects.selectors
	currentVariant?: ProductVariant
	options?: string[]
	variantData?: ProductVariant[]
	constructor() {
		super()
		this.setInstanceSelectors()
		this.addEventListener('change', this.onVariantChange)
	}

	setInstanceSelectors() {
		this.instanceSelectors = VariantSelects.selectors
	}

	onVariantChange() {
		this.updateOptions()
		this.updateMasterId()
		this.toggleAddButton(true, '', false)
		this.updatePickupAvailability()
		this.removeErrorMessage()
		this.updateVariantStatuses()

		if (!this.currentVariant) {
			this.toggleAddButton(true, '', true)
			this.setUnavailable()
		} else {
			this.updateMedia()
			this.updateURL()
			this.updateVariantInput()
			this.renderProductInfo()
			this.updateShareUrl()
		}
	}

	updateOptions() {
		this.options = Array.from(
			qsaRequired<HTMLSelectElement>('select', this),
			(select) => select.value
		)
	}

	updateMasterId() {
		this.currentVariant = this.getVariantData().find((variant) => {
			return !variant.options
				.map((option, index) => {
					return this.options && this.options[index] === option
				})
				.includes(false)
		})
	}

	updateMedia() {
		const currentVariant = this.currentVariant
		if (!currentVariant) return
		if (!currentVariant.featured_media) return

		const mediaGalleries = qsaOptional<MediaGallery>(
			`[id^="MediaGallery-${this.dataset.section}"]`
		)
		mediaGalleries?.forEach((mediaGallery) =>
			mediaGallery.setActiveMedia(
				`${this.dataset.section}-${currentVariant.featured_media.id}`,
				true
			)
		)

		const modalContent = qsOptional(
			`#ProductModal-${this.dataset.section} .product-media-modal__content`
		)
		if (!modalContent) return
		const newMediaModal = qsRequired(
			`[data-media-id="${currentVariant.featured_media.id}"]`,
			modalContent
		)
		modalContent.prepend(newMediaModal)
	}

	updateURL() {
		if (!this.currentVariant || this.dataset.updateUrl === 'false') return
		window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`)
	}

	updateShareUrl() {
		if (!this.currentVariant) throw new Error('cannot updateShareUrl without currentVariant')
		const shareButton = qsOptional<ShareButton>(`#Share-${this.dataset.section}`)
		if (!shareButton || !shareButton.updateUrl) return
		shareButton.updateUrl(
			`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
		)
	}

	updateVariantInput() {
		const currentVariant = this.currentVariant
		if (!currentVariant) throw new Error('cannot updateVariantInput without currentVariant')
		const productForms = qsaOptional(
			`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
		)
		productForms?.forEach((productForm) => {
			const input = qsRequired<HTMLInputElement>('input[name="id"]', productForm)
			input.value = `${currentVariant.id}`
			input.dispatchEvent(new Event('change', { bubbles: true }))
		})
	}

	getVariantOptionFromIndex(variant: ProductVariant, index: number) {
		switch (index) {
			case 1:
				return variant.option1
			case 2:
				return variant.option2
			case 3:
				return variant.option3
			default:
				throw new Error('invalid index')
		}
	}

	updateVariantStatuses() {
		if (!this.variantData) throw new Error('cannot updateVariantStatuses without variantData')
		const selectedOptionOneVariants = this.variantData.filter(
			(variant) =>
				qsRequired<HTMLInputElement | HTMLOptionElement>(':checked', this).value ===
				variant.option1
		)
		const inputWrapperNodes = qsaOptional('.product-form__input', this)
		const inputWrappers = inputWrapperNodes?.length ? Array.from(inputWrapperNodes) : []
		if (inputWrappers.length) {
			inputWrappers.forEach((option: HTMLElement, index: number) => {
				if (index === 0) return
				const optionInputNodes = qsaOptional<HTMLInputElement | HTMLOptionElement>(
					'input[type="radio"], option',
					option
				)
				const optionInputs = optionInputNodes?.length ? Array.from(optionInputNodes) : []

				const previousOptionSelected = qsRequired<HTMLInputElement | HTMLOptionElement>(
					':checked',
					inputWrappers[index - 1]
				).value
				const availableOptionInputsValue = selectedOptionOneVariants
					.filter(
						(variant) =>
							variant.available &&
							this.getVariantOptionFromIndex(variant, index) ===
								previousOptionSelected
					)
					.map((variantOption) =>
						this.getVariantOptionFromIndex(variantOption, index + 1)
					)
				this.setInputAvailability(optionInputs, availableOptionInputsValue)
			})
		} else {
			console.warn('no input wrappers found')
		}
	}

	setInputAvailability(listOfOptions:(HTMLInputElement|HTMLOptionElement)[], listOfAvailableOptions:(string|null)[]) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
				input.innerText = getAttributeOrThrow('value', input)
			} else {
				input.innerText = window.variantStrings.unavailable_with_option.replace(
					'[value]',
          getAttributeOrThrow('value', input)
				)
			}
		})
	}

	updatePickupAvailability() {
		const pickUpAvailability = qsOptional<PickupAvailability>('pickup-availability')
		if (!pickUpAvailability) return
		const currentVariant = this.currentVariant

		if (currentVariant && currentVariant.available) {
			pickUpAvailability.fetchAvailability(`${currentVariant.id}`)
		} else {
			pickUpAvailability.removeAttribute('available')
			pickUpAvailability.innerHTML = ''
		}
	}

	removeErrorMessage() {
		const section = this.closest('section')
		if (!section) return

		const productForm = qsOptional<ProductForm>('product-form', section)
		if (productForm) productForm.handleErrorMessage()
	}

	renderProductInfo() {
		if (!this.currentVariant)
			throw new Error('this.currentVariant not selected, renderProductInfo called too early')
		const requestedVariantId = this.currentVariant.id
		const sectionId = this.dataset.originalSection
			? this.dataset.originalSection
			: getAttributeOrThrow('data-section', this)

		fetch(
			`${this.dataset.url}?variant=${requestedVariantId}&section_id=${
				this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section
			}`
		)
			.then((response) => response.text())
			.then((responseText) => {
				if (!this.currentVariant)
					throw new Error(
						'this.currentVariant not selected, renderProductInfo called too early'
					)
				// prevent unnecessary ui changes from abandoned selections
				if (this.currentVariant.id !== requestedVariantId) return

				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const destination = document.getElementById(`price-${this.dataset.section}`)
				const source = html.getElementById(
					`price-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				)
				const skuSource = html.getElementById(
					`Sku-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				)
				const skuDestination = document.getElementById(`Sku-${this.dataset.section}`)
				const inventorySource = qsOptional(
					`#Inventory-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`,
					html
				)
				const inventoryDestination = document.getElementById(
					`Inventory-${this.dataset.section}`
				)

				if (source && destination) destination.innerHTML = source.innerHTML
				if (inventorySource && inventoryDestination)
					inventoryDestination.innerHTML = inventorySource.innerHTML
				if (skuSource && skuDestination) {
					skuDestination.innerHTML = skuSource.innerHTML
					skuDestination.classList.toggle(
						'visibility-hidden',
						skuSource.classList.contains('visibility-hidden')
					)
				}

				const price = document.getElementById(`price-${this.dataset.section}`)

				if (price) price.classList.remove('visibility-hidden')

				if (inventoryDestination)
					inventoryDestination.classList.toggle(
						'visibility-hidden',
						inventorySource?.innerText === ''
					)

				const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`)
				this.toggleAddButton(
					addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true,
					window.variantStrings.soldOut
				)

				publish(
					PUB_SUB_EVENTS.variantChange,
					createVariantChangeEvent({
						source: 'product-form',
						data: {
							sectionId,
							html,
							variant: this.currentVariant,
						},
					})
				)
			})
	}

	toggleAddButton(disable = true, text: string, modifyClass = true) {
		const productForm = qsRequired<HTMLFormElement>(`#product-form-${this.dataset.section}`)
		if (!productForm) return
		const addButton = qsOptional('[name="add"]', productForm)
		const addButtonText = qsOptional('[name="add"] > span', productForm)
		if (!addButton || !addButtonText) return

		if (disable) {
			addButton.setAttribute('disabled', 'disabled')
			if (text) addButtonText.textContent = text
		} else {
			addButton.removeAttribute('disabled')
			addButtonText.textContent = window.variantStrings.addToCart
		}

		if (!modifyClass) return
	}

	setUnavailable() {
		const button = qsRequired(`#product-form-${this.dataset.section}`)
		const addButton = qsOptional('[name="add"]', button)
		const addButtonText = qsOptional('[name="add"] > span', button)
		const price = document.getElementById(`price-${this.dataset.section}`)
		const inventory = document.getElementById(`Inventory-${this.dataset.section}`)
		const sku = document.getElementById(`Sku-${this.dataset.section}`)

		if (!addButton || !addButtonText) return
		addButtonText.textContent = window.variantStrings.unavailable
		if (price) price.classList.add('visibility-hidden')
		if (inventory) inventory.classList.add('visibility-hidden')
		if (sku) sku.classList.add('visibility-hidden')
	}

	getVariantData(): ProductVariant[] {
		const textContent = qsRequired<HTMLScriptElement>(
			'[type="application/json"]',
			this
		).textContent
		if (!textContent) throw new Error('Variant data not found')
		const updatedVariantData = this.variantData ?? JSON.parse(textContent)
		this.variantData = updatedVariantData
		return updatedVariantData
	}
}
