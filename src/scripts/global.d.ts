import {
	type CountryProvinceSelector,
	type ShopifyPostLinkOptions,
} from '@/scripts/customer/shopify'
import { type Media, MediaManager } from '@/scripts/core/media'
import { type Hls } from 'hls.js/dist/hls.light.js'
import { type ModelViewerUIReference } from '@/scripts/optional/product-model'

interface Ucoast {
	shopifyConsentAPILoaded: boolean
	mediaManager: MediaManager
	iOS: boolean
	openMenuId?: string
}

type PaymentButtonReference = {
	init: () => void
} & typeof HTMLElement

interface CustomerPrivacy {
	analyticsProcessingAllowed: () => boolean
	doesMerchantSupportGranularConsent: () => boolean
	firstPartyMarketingAllowed: () => boolean
	getCCPAConsent: () => string
	getRegion: () => string
	getRegulation: () => string
	getShopPrefs: () => { limit: unknown[] }
	getTrackingConsent: () => string

	currentVisitorConsent: () => {
		marketing: string
		analytics: string
		preferences: string
		sale_of_data: string
	}
	shouldShowGDPRBanner: () => boolean
	shouldShowCCPABanner: () => boolean
	userCanBeTracked: () => boolean
	setTrackingConsent: (
		consent: boolean,
		callback: (error?: string) => void
	) => void
	preferencesProcessingAllowed: () => boolean
	thirdPartyMarketingAllowed: () => boolean
	userDataCanBeSold: () => boolean
	getTrackingConsentMetafield: () => undefined | unknown
	isRegulationEnforced: () => boolean
	marketingAllowed: () => boolean
	saleOfDataAllowed: () => boolean
	saleOfDataRegion: () => string
	setCCPAConsent: (
		consent: boolean,
		callback: (error?: string) => void
	) => void
	shouldShowBanner: () => boolean
}
interface Shopify {
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
	routes?: Routes
	analytics?: {
		replayQueue: any[]
	}
	modules?: boolean
	recaptchaV3?: {
		siteKey: string
	}
	customerPrivacy: CustomerPrivacy
	CountryProvinceSelector?: CountryProvinceSelector
	PaymentButton?: PaymentButtonReference
	ModelViewerUI?: ModelViewerUIReference
	designMode: boolean
	loadFeatures: (
		features: {
			name: string
			version: string
			onLoad?: (error: Error | Error[]) => void
		}[],
		errorCallback?: (error: unknown) => void
	) => void
	postLink?: (target: string, options: ShopifyPostLinkOptions) => void
	trackingConsent?: {}
}

interface Routes {
	cart_add_url: string
	cart_change_url: string
	cart_update_url: string
	cart_url: string
	predictive_search_url: string
}

interface CartStrings {
	error: string
	quantityError: string
}

interface VariantStrings {
	addToCart: string
	preorder: string
	addToWaitlist: string
	soldOut: string
	unavailable: string
	unavailable_with_option: string
}
interface QuickOrderListStrings {
	itemsAdded: string
	itemAdded: string
	itemsRemoved: string
	itemRemoved: string
	viewCart: string
	each: string
	min_error: string
	max_error: string
	step_error: string
}
interface AccessibilityStrings {
	imageAvailable: string
	shareSuccess: string
	pauseSlideshow: string
	playSlideshow: string
	recipientFormExpanded: string
	recipientFormCollapsed: string
	countrySelectorSearchCount: string
}

declare global {
	interface Window {
		routes: Routes
		shopUrl: string
		Shopify?: Shopify
		Ucoast: Ucoast
		cartStrings: CartStrings
		variantStrings: VariantStrings
		quickOrderListStrings: QuickOrderListStrings
		accessibilityStrings: AccessibilityStrings
		ShopifyXR?: {
			setupXRElements: () => void
			addModels: (json: any) => void
		}
		ProductModel?: WindowProductModel
	}
}

declare module 'hls.js/dist/hls.light.js' {
	export default Hls
}

export type Hls = Hls

export {}
