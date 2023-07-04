import { DetailsModal } from '@/scripts/theme/details-modal'
import { qsRequired } from '@/scripts/functions';

class PasswordModal extends DetailsModal {
	constructor() {
		super()

		if (this.querySelector('input[aria-invalid="true"]'))
			this.open({ target: qsRequired('details', this) })
	}
}

customElements.define('password-modal', PasswordModal)
