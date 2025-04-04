import { DetailsDisclosure } from '@/scripts/theme/details-disclosure'
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class ShareButton extends DetailsDisclosure {
	static override htmlSelector = 'share-button'
	static selectors = {
		shareButton: '[data-uc-share-button]',
		shareSummary: '[data-uc-share-summary]',
		closeButton: '[data-uc-share-button-close]',
		copyButton: '[data-uc-share-button-copy]',
		successMessage: '[data-uc-share-message]',
		urlInput: 'input',
	}
	elements: {
		shareButton: HTMLButtonElement
		shareSummary: HTMLElement
		closeButton: HTMLElement
		successMessage: HTMLElement
		urlInput: HTMLInputElement
	}
	urlToShare: string
	constructor() {
		super()

		this.elements = {
			shareButton: q.rs(ShareButton.selectors.shareButton, this),
			shareSummary: q.rs(ShareButton.selectors.shareSummary, this),
			closeButton: q.rs(ShareButton.selectors.closeButton, this),
			successMessage: q.rs(ShareButton.selectors.successMessage, this),
			urlInput: q.rs(ShareButton.selectors.urlInput, this),
		}
		this.urlToShare = this.elements.urlInput
			? this.elements.urlInput.value
			: document.location.href

		if (navigator.share) {
			this.mainDetailsToggle.setAttribute('hidden', '')
			this.elements.shareButton.classList.remove('hidden')
			this.elements.shareButton.addEventListener('click', () => {
				void navigator.share({ url: this.urlToShare, title: document.title })
			})
		} else {
			this.mainDetailsToggle.addEventListener('toggle', this.toggleDetails.bind(this))
			q.rs(ShareButton.selectors.copyButton, this.mainDetailsToggle).addEventListener(
				'click',
				this.copyToClipboard.bind(this)
			)
			q.rs(ShareButton.selectors.closeButton, this.mainDetailsToggle).addEventListener(
				'click',
				this.close.bind(this)
			)
		}
	}

	toggleDetails() {
		if (!this.mainDetailsToggle.open) {
			this.elements.successMessage.classList.add('hidden')
			this.elements.successMessage.textContent = ''
			this.elements.closeButton.classList.add('hidden')
			this.elements.shareSummary.focus()
		}
	}

	copyToClipboard() {
		navigator.clipboard.writeText(this.elements.urlInput.value).then(() => {
			this.elements.successMessage.classList.remove('hidden')
			this.elements.successMessage.textContent = window.accessibilityStrings.shareSuccess
			this.elements.closeButton.classList.remove('hidden')
			this.elements.closeButton.focus()
		})
	}

	updateUrl(url: string) {
		this.urlToShare = url
		this.elements.urlInput.value = url
	}
}
