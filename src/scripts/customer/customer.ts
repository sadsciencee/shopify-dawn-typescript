import { TsDOM as q } from '@/scripts/core/TsDOM'
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
		const Shopify = window.Shopify
		if (Shopify && Shopify.CountryProvinceSelector && this.elements) {
			new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
				hideElement: 'AddressProvinceContainerNew',
			})
			this.elements.countrySelects.forEach((select: HTMLSelectElement) => {

				const formId = select.dataset.formId
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
		const currentTarget = targetClosestOptional(event, selectors.addressContainer)
		const toggleEl = qsRequired(`[${attributes.expanded}]`, currentTarget)
		this._toggleExpanded(toggleEl)
	}

	_handleDeleteButtonClick = (event: Event) => {
		const currentTarget = currentTargetRequired(event)
		const confirmMessage = currentTarget.getAttribute(attributes.confirmMessage)
		const target = currentTarget.dataset.target
		if (!confirmMessage || !target) return
		if (confirm(confirmMessage)) {
			const Shopify = window.Shopify
			console.log({Shopify})
			if (!Shopify?.postLink) return
			Shopify.postLink(target, {
				parameters: { _method: 'delete' },
			})
		}
	}
}

export function initializeCustomerAddresses() {
	// this is a direct copy form Shopify's customer management.
	// TBH, this should never change, and every time I try to 'typescriptify' it, something gets borken
	if (typeof window.Shopify == 'undefined') {
		window.Shopify = {};
	}

	Shopify.bind = function (fn, scope) {
		return function () {
			return fn.apply(scope, arguments);
		};
	};

	Shopify.setSelectorByValue = function (selector, value) {
		for (var i = 0, count = selector.options.length; i < count; i++) {
			var option = selector.options[i];
			if (value == option.value || value == option.innerHTML) {
				selector.selectedIndex = i;
				return i;
			}
		}
	};

	Shopify.addListener = function (target, eventName, callback) {
		target.addEventListener
			? target.addEventListener(eventName, callback, false)
			: target.attachEvent('on' + eventName, callback);
	};

	Shopify.postLink = function (path, options) {
		options = options || {};
		var method = options['method'] || 'post';
		var params = options['parameters'] || {};

		var form = document.createElement('form');
		form.setAttribute('method', method);
		form.setAttribute('action', path);

		for (var key in params) {
			var hiddenField = document.createElement('input');
			hiddenField.setAttribute('type', 'hidden');
			hiddenField.setAttribute('name', key);
			hiddenField.setAttribute('value', params[key]);
			form.appendChild(hiddenField);
		}
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};

	Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
		this.countryEl = document.getElementById(country_domid);
		this.provinceEl = document.getElementById(province_domid);
		this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

		Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

		this.initCountry();
		this.initProvince();
	};

	Shopify.CountryProvinceSelector.prototype = {
		initCountry: function () {
			var value = this.countryEl.getAttribute('data-default');
			Shopify.setSelectorByValue(this.countryEl, value);
			this.countryHandler();
		},

		initProvince: function () {
			var value = this.provinceEl.getAttribute('data-default');
			if (value && this.provinceEl.options.length > 0) {
				Shopify.setSelectorByValue(this.provinceEl, value);
			}
		},

		countryHandler: function (e) {
			var opt = this.countryEl.options[this.countryEl.selectedIndex];
			var raw = opt.getAttribute('data-provinces');
			var provinces = JSON.parse(raw);

			this.clearOptions(this.provinceEl);
			if (provinces && provinces.length == 0) {
				this.provinceContainer.style.display = 'none';
			} else {
				for (var i = 0; i < provinces.length; i++) {
					var opt = document.createElement('option');
					opt.value = provinces[i][0];
					opt.innerHTML = provinces[i][1];
					this.provinceEl.appendChild(opt);
				}

				this.provinceContainer.style.display = '';
			}
		},

		clearOptions: function (selector) {
			while (selector.firstChild) {
				selector.removeChild(selector.firstChild);
			}
		},

		setOptions: function (selector, values) {
			for (var i = 0, count = values.length; i < values.length; i++) {
				var opt = document.createElement('option');
				opt.value = values[i];
				opt.innerHTML = values[i];
				selector.appendChild(opt);
			}
		},
	};


	window.addEventListener('load', () => {
		typeof CustomerAddresses !== 'undefined' && new CustomerAddresses();
	});
}
