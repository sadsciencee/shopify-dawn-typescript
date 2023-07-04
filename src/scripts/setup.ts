import { CountryProvinceSelector } from './shopify';

// this file used to have a bunch of functions as well as the uCoastShopify class
// we have a new file that's just Shopify that will be used for all theme-defined functions
// the remaining code here is to deal with the window.Shopify object which can be extremely variable
// TODO: refactor existing Shopify object to be more extendable so that we can use window.Shopify functions from within the class


type PaymentButtonReference = {
	init: () => void
} & typeof HTMLElement



export type ModelViewerUIReference = {
	pause: () => void;
	new (modelViewEl: HTMLElement): ModelViewerUIReference;
} & typeof HTMLElement;

export class uCoastShopify {
	shop?: string
	locale?: string
	currency?: {
		active: string
		rate: string
	}
	country?: string
	theme?: {
		name: string
		id: number
		theme_store_id: number
		role: string
		handle: string
		style: {
			id: string
			handle: string
		}
	}
	cdnHost?: string
	routes?: {
		root: string
	}
	analytics?: {
		replayQueue: any[]
	}
	modules?: boolean
	recaptchaV3?: {
		siteKey: string
	}
	CountryProvinceSelector: typeof CountryProvinceSelector
	PaymentButton?: PaymentButtonReference
	ModelViewerUI?: ModelViewerUIReference
	designMode: boolean
	loadFeatures?: (
		array: { name: string; version: string, onLoad: (error: Error | Error[]) => void }[],
	) => void
	customerPrivacy?: {
		shouldShowGDPRBanner: () => boolean
		shouldShowCCPABanner: () => boolean
		userCanBeTracked: () => boolean
		getTrackingConsent: () => string
		setTrackingConsent: (consent: boolean, callback: (error?: string) => void) => void
		preferencesProcessingAllowed: () => boolean
		thirdPartyMarketingAllowed: () => boolean
		analyticsProcessingAllowed: () => boolean
		currentVisitorConsent: () => string
		userDataCanBeSold: () => boolean
	}

	constructor(config: Partial<uCoastShopify>) {
		this.shop = config.shop
		this.locale = config.locale
		this.currency = config.currency
		this.country = config.country
		this.theme = config.theme
		this.cdnHost = config.cdnHost
		this.routes = config.routes
		this.analytics = config.analytics
		this.modules = config.modules
		this.PaymentButton = config.PaymentButton
		this.recaptchaV3 = config.recaptchaV3
		this.designMode = config.designMode ?? false
		this.CountryProvinceSelector = CountryProvinceSelector
	}

	public bind(fn: Function, scope: CountryProvinceSelector) {
		return function () {
			return fn.apply(scope, arguments)
		}
	}

	public setSelectorByValue(selector: HTMLSelectElement, value: string) {
		for (let i = 0, count = selector.options.length; i < count; i++) {
			let option = selector.options[i]
			if (value == option.value || value == option.innerHTML) {
				selector.selectedIndex = i
				return i
			}
		}
	}

	public addListener = function (
		target: HTMLElement,
		eventName: string,
		callback: (event: Event) => void
	) {
		if (!(target instanceof HTMLElement)) return
		if (target.addEventListener) {
			target.addEventListener(eventName, callback, false)
		} else if ((target as any).attachEvent) {
			;(target as any).attachEvent('on' + eventName, callback)
		}
	}

	public postLink(path: string, options: { parameters: { _method?: string } }) {
		if (!options || !options.parameters || !options.parameters._method) return
		options = options || {}
		let method = options['parameters']['_method'] || 'post'
		let form = document.createElement('form')
		form.setAttribute('method', method)
		form.setAttribute('action', path)
		let hiddenField = document.createElement('input')
		hiddenField.setAttribute('type', 'hidden')
		hiddenField.setAttribute('name', '_method')
		hiddenField.setAttribute('value', method)
		form.appendChild(hiddenField)

		document.body.appendChild(form)
		form.submit()
		document.body.removeChild(form)
	}
}

type routesType = {
	cart_add_url: string
	cart_change_url: string
	cart_update_url: string
	cart_url: string
	predictive_search_url: string
	root: string
}

type cartStringsType = {
	error: string
	quantityError: string
}

type variantStringsType = {
	addToCart: string
	soldOut: string
	unavailable: string
	unavailable_with_option: string
	preorder: string
	comingSoon: string
}

type accessibilityStringsType = {
	imageAvailable: string
	shareSuccess: string
	pauseSlideshow: string
	playSlideshow: string
	recipientFormExpanded: string
	recipientFormCollapsed: string
}

export interface uCoastWindow extends Window {
	routes: routesType
	Shopify: uCoastShopify
	klaviyoPopupWaitingForConsent?: boolean
	demoMode?: boolean
	cartStrings: cartStringsType
	shopUrl: string
	variantStrings: variantStringsType
	accessibilityStrings: accessibilityStringsType
	ShopifyXR?: {
		setupXRElements: () => void
		addModels: (json: any) => void
	}
	ProductModel?: unknown
	loadHls?: () => void
}

declare let window: uCoastWindow

export const routes: routesType =
	window && window?.routes
		? window.routes
		: {
				cart_add_url: '/cart/add',
				cart_change_url: '/cart/change',
				cart_update_url: '/cart/update',
				cart_url: '/cart',
				predictive_search_url: '/search/suggest',
				root: '/',
		  }

export const cartStrings: cartStringsType =
	window && window?.cartStrings
		? window.cartStrings
		: {
				error: '',
				quantityError: '',
		  }

export const shopUrl = window && window?.shopUrl ? window.shopUrl : '/'

export const variantStrings: variantStringsType =
	window && window?.variantStrings
		? window.variantStrings
		: {
				addToCart: '',
				soldOut: '',
				preorder: '',
				comingSoon: '',
				unavailable: '',
				unavailable_with_option: '',
		  }

export const accessibilityStrings: accessibilityStringsType = {
	imageAvailable: '',
	shareSuccess: '',
	pauseSlideshow: '',
	playSlideshow: '',
}

export function initShopify() {
	return new uCoastShopify(window && window?.Shopify ? window.Shopify : { designMode: false })
}
