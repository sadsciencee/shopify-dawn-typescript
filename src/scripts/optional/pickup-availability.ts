import { getAttributeOrThrow, qsOptional, qsRequired, targetRequired } from '@/scripts/functions'
import { PickupAvailabilityDrawer } from '@/scripts/optional/pickup-availability-drawer'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class PickupAvailability extends UcoastEl {
	static htmlSelector = 'pickup-availability'
	errorHtml?: Node | null
	constructor() {
		super()

		if (!this.hasAttribute('available')) return
		const template = qsRequired<HTMLTemplateElement>('template', this)
		const content = template.content
		const firstElementChild = content.firstElementChild
		if (!content || !firstElementChild || firstElementChild === null) {
			console.error('No template content found in PickupAvailability')
		}

		this.errorHtml = firstElementChild?.cloneNode(true)
		this.onClickRefreshList = this.onClickRefreshList.bind(this)
		const variantId = getAttributeOrThrow('variant-id', this)
		this.fetchAvailability(variantId)
	}

	fetchAvailability(variantId: string) {
		let rootUrl = this.dataset.rootUrl
		if (!rootUrl) {
			rootUrl = window.location.origin
		}
		if (!rootUrl.endsWith('/')) {
			rootUrl = rootUrl + '/'
		}
		const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`

		fetch(variantSectionUrl)
			.then((response) => response.text())
			.then((text) => {
				const sectionInnerHTML = new DOMParser()
					.parseFromString(text, 'text/html')
					.querySelector('.shopify-section')
				if (sectionInnerHTML instanceof Document) {
					this.renderPreview(sectionInnerHTML)
				} else {
					throw new Error(
						'No shopify-section found in sectionInnerHTML or was not instance of document'
					)
				}
			})
			.catch((error) => {
				console.error(error)
				const button = this.querySelector('button')
				if (button) button.removeEventListener('click', this.onClickRefreshList)
				this.renderError()
			})
	}

	onClickRefreshList(_event: Event) {
		const variantId = getAttributeOrThrow('variant-id', this)
		this.fetchAvailability(variantId)
	}

	renderError() {
		this.innerHTML = ''
		if (!this.errorHtml) throw new Error('renderError thrown too early')
		this.appendChild(this.errorHtml)

		const button = qsRequired('button', this)
		button.addEventListener('click', this.onClickRefreshList)
	}

	renderPreview(sectionInnerHTML: Document) {
		const drawer = qsOptional<PickupAvailabilityDrawer>('pickup-availability-drawer')
		if (drawer) drawer.remove()
		const pickupAvailabilityPreview = qsOptional(
			'pickup-availability-preview',
			sectionInnerHTML
		)
		if (!pickupAvailabilityPreview) {
			this.innerHTML = ''
			this.removeAttribute('available')
			return
		}

		this.innerHTML = pickupAvailabilityPreview.outerHTML
		this.setAttribute('available', '')
		const drawerNode = sectionInnerHTML.querySelector('pickup-availability-drawer')

		if (drawerNode instanceof Node) {
			document.body.appendChild(drawerNode)
		} else {
			throw new Error('No pickup-availability-drawer found in sectionInnerHTML')
		}

		const button = this.querySelector('button')
		if (button)
			button.addEventListener('click', (event: MouseEvent) => {
				const drawer = qsRequired<PickupAvailabilityDrawer>('pickup-availability-drawer')
				const target = targetRequired(event)
				drawer.show(target)
			})
	}
}
