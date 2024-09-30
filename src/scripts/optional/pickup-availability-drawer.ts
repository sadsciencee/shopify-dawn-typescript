import { TsDOM as q } from '@/scripts/core/TsDOM'
import { UcoastEl } from '@/scripts/core/UcoastEl'

export class PickupAvailabilityDrawer extends UcoastEl {
	static htmlSelector = 'pickup-availability-drawer'
	onBodyClick: (event: MouseEvent) => void
	opener: HTMLButtonElement
	focusElement?: HTMLElement
	constructor() {
		super()

		this.onBodyClick = this.handleBodyClick.bind(this)
		this.opener = q.rs('button', this)

		this.opener.addEventListener('click', () => {
			this.hide()
		})

		this.addEventListener('keyup', (event) => {
			if (event.code?.toUpperCase() === 'ESCAPE') this.hide()
		})
	}

	handleBodyClick(event: MouseEvent) {
		const target = q.rt(event)
		if (
			target != this &&
			!target.closest('pickup-availability-drawer') &&
			target.id != 'ShowPickupAvailabilityDrawer'
		) {
			this.hide()
		}
	}

	hide() {
		this.removeAttribute('open')
		document.body.removeEventListener('click', this.onBodyClick)
		document.body.classList.remove('overflow-hidden')
		window.TsDOM.removeTrapFocus(this.focusElement)
	}

	show(focusElement: HTMLElement) {
		this.focusElement = focusElement
		this.setAttribute('open', '')
		document.body.addEventListener('click', this.onBodyClick)
		document.body.classList.add('overflow-hidden')
		window.TsDOM.trapFocus(this)
	}
}
