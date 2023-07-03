import { DetailsDisclosure } from '@/scripts/theme/details-disclosure'
import { qsRequired } from '@/scripts/functions'
import { type uCoastWindow } from '@/scripts/setup';

declare let window: uCoastWindow

export class ShareButton extends DetailsDisclosure {
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
			shareButton: qsRequired('button', this),
			shareSummary: qsRequired('summary', this),
			closeButton: qsRequired('.share-button__close', this),
			successMessage: qsRequired('[id^="ShareMessage"]', this),
			urlInput: qsRequired('input', this),
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
			qsRequired('.share-button__copy', this.mainDetailsToggle).addEventListener(
				'click',
				this.copyToClipboard.bind(this)
			)
			qsRequired('.share-button__close', this.mainDetailsToggle).addEventListener(
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
