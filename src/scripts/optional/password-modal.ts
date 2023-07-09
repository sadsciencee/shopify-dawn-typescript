import { DetailsModal } from '@/scripts/theme/details-modal'
import { qsRequired } from '@/scripts/core/global'

export class PasswordModal extends DetailsModal {
	static override htmlSelector = 'password-modal'
	constructor() {
		super()

		if (this.querySelector('input[aria-invalid="true"]'))
			this.open({ target: qsRequired('details', this) })
	}
}
