import { ModalDialog } from '@/scripts/theme/modal-dialog'
import { KlaviyoForm } from '@/scripts/theme/klaviyo-form'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { getActiveOrAccessibilityElement } from '@/scripts/core/cart-functions'

export class WelcomePopup extends ModalDialog {
	static override htmlSelector = 'welcome-popup'
	klaviyoForm: KlaviyoForm
	openAfter: number
	cacheKey: string
	openers?: NodeListOf<HTMLButtonElement>
	demoMode: boolean

	constructor() {
		super()
		this.klaviyoForm = qsRequired<KlaviyoForm>('klaviyo-form', this)
		this.openAfter =
			parseInt(getAttributeOrThrow('data-uc-open-after', this)) * 1000
		this.cacheKey = getAttributeOrThrow('data-uc-cache-key', this)
		this.demoMode =
			getAttributeOrThrow('data-uc-demo-mode', this) === 'true'

		this.initializePopup()
		// note: the code below should be used if the consentmo app is used for customer consent
		/*document.addEventListener("visitorConsentCollected", (event) => {
			const consentEvent = event as CustomEvent<ShopifyConsentAPIDetail>;
			if (consentEvent.detail.marketingAllowed && consentEvent.detail.analyticsAllowed) {
				this.initializePopup()
			}
		});*/
	}

	initializePopup() {
		if (this.isKeyDisabled() && !this.demoMode) return
		window.setTimeout(() => {
			if (!this.dataPrivacyIsOpen()) {
				this.show(getActiveOrAccessibilityElement())
				window.Ucoast.mediaManager.loadAllInContainer(this)
			}

		}, this.openAfter)
	}

	dataPrivacyIsOpen() {
		const dataPrivacyModal =
			qsOptional('.cc-window') ??
			qsOptional('[aria-describedby="cookieconsent:desc"]')
		if (!dataPrivacyModal) return false
		return !dataPrivacyModal.classList.contains('cc-invisible')
	}

	override getHtmlSelector() {
		return WelcomePopup.htmlSelector
	}

	override connectedCallback() {
		this.initializePopup()
	}

	override show(opener: HTMLElement) {
		this.removeAttribute('style')
		window.setTimeout(() => {
			super.show(opener)
		}, 2)
	}

	override hide() {
		super.hide()
		this.disableKey()
	}

	isKeyDisabled() {
		const disabledKey = window.localStorage.getItem('disable_klaviyo')
		if (!disabledKey) return false
		return disabledKey === this.cacheKey
	}

	disableKey() {
		window.localStorage.setItem('disable_klaviyo', this.cacheKey)
	}
}
