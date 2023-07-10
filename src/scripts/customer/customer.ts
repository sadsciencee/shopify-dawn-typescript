import { Shopify } from '@/scripts/customer/shopify'
import {
	currentTargetRequired,
	qsaRequired,
	qsOptional,
	qsRequired,
	targetClosestOptional,
} from '@/scripts/core/global'

const selectors = {
	customerAddresses: '[data-customer-addresses]',
	addressCountrySelect: '[data-address-country-select]',
	addressContainer: '[data-address]',
	toggleAddressButton: 'button[aria-expanded]',
	cancelAddressButton: 'button[type="reset"]',
	deleteAddressButton: 'button[data-confirm-message]',
}

const attributes = {
	expanded: 'aria-expanded',
	confirmMessage: 'data-confirm-message',
}

class CustomerAddresses {
	elements?: {
		container: HTMLElement
		addressContainer: HTMLElement
		cancelButtons: NodeListOf<HTMLButtonElement>
		deleteButtons: NodeListOf<HTMLButtonElement>
		countrySelects: NodeListOf<HTMLSelectElement>
		toggleButtons: NodeListOf<HTMLButtonElement>
	}
	constructor() {
		this.elements = this._getElements()
		this._setupCountries()
		this._setupEventListeners()
	}

	_getElements() {
		const container = qsOptional(selectors.customerAddresses)
		return container
			? {
					container,
					addressContainer: qsRequired(selectors.addressContainer, container),
					toggleButtons: qsaRequired<HTMLButtonElement>(selectors.toggleAddressButton),
					cancelButtons: qsaRequired<HTMLButtonElement>(
						selectors.cancelAddressButton,
						container
					),
					deleteButtons: qsaRequired<HTMLButtonElement>(
						selectors.deleteAddressButton,
						container
					),
					countrySelects: qsaRequired<HTMLSelectElement>(
						selectors.addressCountrySelect,
						container
					),
			  }
			: undefined
	}

	_setupCountries() {
		if (Shopify && Shopify.CountryProvinceSelector && this.elements) {
			// eslint-disable-next-line no-new
			// shopify is ignoring this, so we have to ignore it too
			// @ts-ignore
			new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
				hideElement: 'AddressProvinceContainerNew',
			})
			this.elements.countrySelects.forEach((select: HTMLSelectElement) => {

				const formId = select.dataset.formId
				console.log({ select, formId })
				// eslint-disable-next-line no-new
				// shopify is ignoring this, so we have to ignore it too
				// @ts-ignore
				new Shopify.CountryProvinceSelector(
					`AddressCountry_${formId}`,
					`AddressProvince_${formId}`,
					{
						hideElement: `AddressProvinceContainer_${formId}`,
					}
				)
			})
		}
	}

	_setupEventListeners() {
		if (!this.elements) return
		this.elements.toggleButtons.forEach((element: HTMLButtonElement) => {
			element.addEventListener('click', this._handleAddEditButtonClick)
		})
		this.elements.cancelButtons.forEach((element: HTMLButtonElement) => {
			element.addEventListener('click', this._handleCancelButtonClick)
		})
		this.elements.deleteButtons.forEach((element: HTMLButtonElement) => {
			element.addEventListener('click', this._handleDeleteButtonClick)
		})
	}

	_toggleExpanded(target: HTMLElement) {
		target.setAttribute(
			attributes.expanded,
			(target.getAttribute(attributes.expanded) === 'false').toString()
		)
	}

	_handleAddEditButtonClick = (event: Event) => {
		const currentTarget = currentTargetRequired(event)
		this._toggleExpanded(currentTarget)
	}

	_handleCancelButtonClick = (event: Event) => {
		const currentTarget = targetClosestOptional(event, 'selectors.addressContainer')
		const toggleEl = qsRequired(`[${attributes.expanded}]`, currentTarget)
		this._toggleExpanded(toggleEl)
	}

	_handleDeleteButtonClick = (event: Event) => {
		const currentTarget = currentTargetRequired(event)
		const confirmMessage = currentTarget.getAttribute(attributes.confirmMessage)
		const target = currentTarget.dataset.target
		if (!confirmMessage || !target) return
		// eslint-disable-next-line no-alert
		if (confirm(confirmMessage)) {
			Shopify.postLink(target, {
				parameters: { _method: 'delete' },
			})
		}
	}
}

export function initializeCustomerAddresses() {
	window.addEventListener('load', () => {
		typeof CustomerAddresses !== 'undefined' && new CustomerAddresses();
	});
}
