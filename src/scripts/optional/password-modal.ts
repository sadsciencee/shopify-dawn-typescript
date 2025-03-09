import { DetailsModal } from '@/scripts/theme/details-modal'
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class PasswordModal extends DetailsModal {
	static override htmlSelector = 'password-modal'
	constructor() {
		super()

		if (this.querySelector('input[aria-invalid="true"]'))
			this.open({ target: q.rs('details', this) })
	}
}
