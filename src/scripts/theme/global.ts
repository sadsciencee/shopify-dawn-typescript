function getFocusableElements(container) {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	)
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
	summary.setAttribute('role', 'button')
	summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'))

	if (summary.nextElementSibling.getAttribute('id')) {
		summary.setAttribute('aria-controls', summary.nextElementSibling.id)
	}

	summary.addEventListener('click', (event) => {
		event.currentTarget.setAttribute(
			'aria-expanded',
			!event.currentTarget.closest('details').hasAttribute('open')
		)
	})

	if (summary.closest('header-drawer, menu-drawer')) return
	summary.parentElement.addEventListener('keyup', onKeyUpEscape)
})

const trapFocusHandlers = {}

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container)
	var first = elements[0]
	var last = elements[elements.length - 1]

	removeTrapFocus()

	trapFocusHandlers.focusin = (event) => {
		if (event.target !== container && event.target !== last && event.target !== first) return

		document.addEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.focusout = function () {
		document.removeEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault()
			first.focus()
		}

		//  On the first focusable element and tab backward, focus the last element.
		if ((event.target === container || event.target === first) && event.shiftKey) {
			event.preventDefault()
			last.focus()
		}
	}

	document.addEventListener('focusout', trapFocusHandlers.focusout)
	document.addEventListener('focusin', trapFocusHandlers.focusin)

	elementToFocus.focus()

	if (
		elementToFocus.tagName === 'INPUT' &&
		['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
		elementToFocus.value
	) {
		elementToFocus.setSelectionRange(0, elementToFocus.value.length)
	}
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
	document.querySelector(':focus-visible')
} catch (e) {
	focusVisiblePolyfill()
}

function focusVisiblePolyfill() {
	const navKeys = [
		'ARROWUP',
		'ARROWDOWN',
		'ARROWLEFT',
		'ARROWRIGHT',
		'TAB',
		'ENTER',
		'SPACE',
		'ESCAPE',
		'HOME',
		'END',
		'PAGEUP',
		'PAGEDOWN',
	]
	let currentFocusedElement = null
	let mouseClick = null

	window.addEventListener('keydown', (event) => {
		if (navKeys.includes(event.code.toUpperCase())) {
			mouseClick = false
		}
	})

	window.addEventListener('mousedown', (event) => {
		mouseClick = true
	})

	window.addEventListener(
		'focus',
		() => {
			if (currentFocusedElement) currentFocusedElement.classList.remove('focused')

			if (mouseClick) return

			currentFocusedElement = document.activeElement
			currentFocusedElement.classList.add('focused')
		},
		true
	)
}


function removeTrapFocus(elementToFocus: HTMLElement | undefined = undefined) {
	document.removeEventListener('focusin', trapFocusHandlers.focusin)
	document.removeEventListener('focusout', trapFocusHandlers.focusout)
	document.removeEventListener('keydown', trapFocusHandlers.keydown)

	if (elementToFocus) elementToFocus.focus()
}

function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== 'ESCAPE') return

	const openDetailsElement = event.target.closest('details[open]')
	if (!openDetailsElement) return

	const summaryElement = openDetailsElement.querySelector('summary')
	openDetailsElement.removeAttribute('open')
	summaryElement.setAttribute('aria-expanded', false)
	summaryElement.focus()
}

function debounce(fn, wait) {
	let t
	return (...args) => {
		clearTimeout(t)
		t = setTimeout(() => fn.apply(this, args), wait)
	}
}

function throttle(fn, delay) {
	let lastCall = 0
	return function (...args) {
		const now = new Date().getTime()
		if (now - lastCall < delay) {
			return
		}
		lastCall = now
		return fn(...args)
	}
}

function fetchConfig(type = 'json') {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
	}
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
	window.Shopify = {}
}

Shopify.bind = function (fn, scope) {
	return function () {
		return fn.apply(scope, arguments)
	}
}

Shopify.setSelectorByValue = function (selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i]
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i
			return i
		}
	}
}

Shopify.addListener = function (target, eventName, callback) {
	target.addEventListener
		? target.addEventListener(eventName, callback, false)
		: target.attachEvent('on' + eventName, callback)
}

Shopify.postLink = function (path, options) {
	options = options || {}
	var method = options['method'] || 'post'
	var params = options['parameters'] || {}

	var form = document.createElement('form')
	form.setAttribute('method', method)
	form.setAttribute('action', path)

	for (var key in params) {
		var hiddenField = document.createElement('input')
		hiddenField.setAttribute('type', 'hidden')
		hiddenField.setAttribute('name', key)
		hiddenField.setAttribute('value', params[key])
		form.appendChild(hiddenField)
	}
	document.body.appendChild(form)
	form.submit()
	document.body.removeChild(form)
}

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
	this.countryEl = document.getElementById(country_domid)
	this.provinceEl = document.getElementById(province_domid)
	this.provinceContainer = document.getElementById(options['hideElement'] || province_domid)

	Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this))

	this.initCountry()
	this.initProvince()
}

Shopify.CountryProvinceSelector.prototype = {
	initCountry: function () {
		var value = this.countryEl.getAttribute('data-default')
		Shopify.setSelectorByValue(this.countryEl, value)
		this.countryHandler()
	},

	initProvince: function () {
		var value = this.provinceEl.getAttribute('data-default')
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value)
		}
	},

	countryHandler: function (e) {
		var opt = this.countryEl.options[this.countryEl.selectedIndex]
		var raw = opt.getAttribute('data-provinces')
		var provinces = JSON.parse(raw)

		this.clearOptions(this.provinceEl)
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = 'none'
		} else {
			for (var i = 0; i < provinces.length; i++) {
				var opt = document.createElement('option')
				opt.value = provinces[i][0]
				opt.innerHTML = provinces[i][1]
				this.provinceEl.appendChild(opt)
			}

			this.provinceContainer.style.display = ''
		}
	},

	clearOptions: function (selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild)
		}
	},

	setOptions: function (selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement('option')
			opt.value = values[i]
			opt.innerHTML = values[i]
			selector.appendChild(opt)
		}
	},
}
