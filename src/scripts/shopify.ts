import { getAttributeOrThrow, qsRequired } from '@/scripts/functions';

export interface ShopifyPostLinkOptions extends RequestInit {
	parameters?: Record<string, string>
}

export class CountryProvinceSelector {
	countryEl: HTMLSelectElement
	provinceEl: HTMLSelectElement
	provinceContainer: HTMLElement
	constructor(country_domid:string, province_domid:string, options: {
		hideElement: string
	}) {
		this.countryEl = qsRequired(`#${country_domid}`)
		this.provinceEl = qsRequired(`#${province_domid}`)
		this.provinceContainer = qsRequired(`#${options['hideElement'] || province_domid}`)
		console.log({
			countryEl: this.countryEl,
			provinceEl: this.provinceEl,
			provinceContainer: this.provinceContainer,
		})

		Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this))

		this.initCountry()
		this.initProvince()
	}

	initCountry() {
		const value = this.countryEl.getAttribute('data-default') ?? ''
		Shopify.setSelectorByValue(this.countryEl, value)
		this.countryHandler()
	}

	initProvince() {
		const value = this.provinceEl.getAttribute('data-default')
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value)
		}
	}

	countryHandler() {
		const opt = this.countryEl.options[this.countryEl.selectedIndex]
		const raw = getAttributeOrThrow('data-provinces', opt)
		const provinces = JSON.parse(raw)

		this.clearOptions(this.provinceEl)
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = 'none'
		} else {
			for (let i = 0; i < provinces.length; i++) {
				const opt = document.createElement('option')
				opt.value = provinces[i][0]
				opt.innerHTML = provinces[i][1]
				this.provinceEl.appendChild(opt)
			}

			this.provinceContainer.style.display = ''
		}
	}

	clearOptions(selector:HTMLSelectElement) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild)
		}
	}

	setOptions(selector:HTMLSelectElement, values:string[]) {
		for (let i = 0, count = values.length; i < count; i++) {
			const opt = document.createElement('option')
			opt.value = values[i]
			opt.innerHTML = values[i]
			selector.appendChild(opt)
		}
	}
}

export class Shopify {
	public bind(fn: Function, scope: CountryProvinceSelector) {
		return function () {
			return fn.apply(scope, arguments)
		}
	}
	static setSelectorByValue(selector: HTMLSelectElement, value: string) {
		for (let i = 0, count = selector.options.length; i < count; i++) {
			const option = selector.options[i]
			if (value == option.value || value == option.innerHTML) {
				selector.selectedIndex = i
				return i
			}
		}
	}
	static addListener(target: EventTarget, eventName: string, callback: EventListenerOrEventListenerObject) {

		target.addEventListener
			? target.addEventListener(eventName, callback, false)
			// internet explorer fallback - typescript doesnt know about this
			// TODO: create a custom type for this
			// @ts-ignore
			: target.attachEvent('on' + eventName, callback)
	}
	static postLink(path:string, options:ShopifyPostLinkOptions) {
		options = options || {}
		const method = options['method'] || 'post'
		const params = options['parameters'] || {}

		const form = document.createElement('form')
		form.setAttribute('method', method)
		form.setAttribute('action', path)

		for (const key in params) {
			const hiddenField = document.createElement('input')
			hiddenField.setAttribute('type', 'hidden')
			hiddenField.setAttribute('name', key)
			hiddenField.setAttribute('value', params[key])
			form.appendChild(hiddenField)
		}
		document.body.appendChild(form)
		form.submit()
		document.body.removeChild(form)
	}
	static CountryProvinceSelector = function (
		country_domid: string,
		province_domid: string,
		options: {
			hideElement: string
		}
	) {
		return new CountryProvinceSelector(country_domid, province_domid, options)
	}
}

/*if (typeof window.Shopify == 'undefined') {
  window.Shopify = {}
}*/
