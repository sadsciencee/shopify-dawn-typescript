import { UcoastEl } from '@/scripts/core/UcoastEl'

export class ArtDirection extends UcoastEl {
	static htmlSelector = 'art-direction'
	constructor() {
		super()
	}

	override async connectedCallback() {
		super.connectedCallback()
	}
	onMediaLoad() {
		this.classList.add('loaded')
	}
}
