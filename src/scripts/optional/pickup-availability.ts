import { TsDOM as q } from '@/scripts/core/TsDOM'
import { type PickupAvailabilityDrawer } from '@/scripts/optional/pickup-availability-drawer'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class PickupAvailability extends UcoastEl {
	static htmlSelector = 'pickup-availability'
	errorHtml?: Node | null
	constructor() {
		super()

		if (!this.hasAttribute('available')) return
		const template = q.rs<HTMLTemplateElement>('template', this)
		const content = template.content
		const firstElementChild = content.firstElementChild
		if (!content || !firstElementChild || firstElementChild === null) {
			console.error('No template content found in PickupAvailability')
		}

		this.errorHtml = firstElementChild?.cloneNode(true)
		this.onClickRefreshList = this.onClickRefreshList.bind(this)
		const variantId = q.ra(this, 'data-variant-id')
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
				const newDocument = new DOMParser().parseFromString(
					text,
					'text/html'
				)
				const sectionInnerHTML = q.rs(
					'.shopify-section',
					newDocument.documentElement
				)
				this.renderPreview(sectionInnerHTML)
			})
			.catch((error) => {
				console.error(error)
				const button = this.querySelector('button')
				if (button)
					button.removeEventListener('click', this.onClickRefreshList)
				this.renderError()
			})
	}

	onClickRefreshList(_event: Event) {
		const variantId = q.ra(this, 'data-variant-id')
		this.fetchAvailability(variantId)
	}

	renderError() {
		this.innerHTML = ''
		if (!this.errorHtml) throw new Error('renderError thrown too early')
		this.appendChild(this.errorHtml)

		const button = q.rs('button', this)
		button.addEventListener('click', this.onClickRefreshList)
	}

	renderPreview(sectionInnerHTML: Document | HTMLElement) {
		const drawer = q.os<PickupAvailabilityDrawer>(
			'pickup-availability-drawer'
		)
		if (drawer) drawer.remove()
		const pickupAvailabilityPreview = q.os(
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
		const drawerNode = sectionInnerHTML.querySelector(
			'pickup-availability-drawer'
		)

		if (drawerNode instanceof Node) {
			document.body.appendChild(drawerNode)
		} else {
			throw new Error(
				'No pickup-availability-drawer found in sectionInnerHTML'
			)
		}

		const button = this.querySelector('button')
		if (button)
			button.addEventListener('click', (event: MouseEvent) => {
				const drawer = q.rs<PickupAvailabilityDrawer>(
					'pickup-availability-drawer'
				)
				const target = q.rt(event)
				drawer.show(target)
			})
	}
}
