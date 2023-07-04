import { VariantSelects } from '@/scripts/theme/variant-selects';
import { qsaOptional } from '@/scripts/functions';

export class VariantRadios extends VariantSelects {
  static override htmlSelector = 'variant-radios';
  constructor() {
    super();
  }

  override setInputAvailability(listOfOptions:(HTMLInputElement|HTMLOptionElement)[], listOfAvailableOptions:(string|null)[]) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }

  override updateOptions() {
    const fieldsetNodes = qsaOptional<HTMLFieldSetElement>('fieldset', this);
    if (!fieldsetNodes) throw new Error('cannot do updateOptions in variant-radios, no fieldset nodes found');
    const fieldsets = Array.from(fieldsetNodes);
    this.options = fieldsets.map((fieldset) => {
      const inputNodes = qsaOptional<HTMLInputElement>('input', fieldset);
      if (!inputNodes) throw new Error('cannot do updateOptions in variant-radios, no input nodes found');
      const inputs = Array.from(inputNodes);
      const checkedInput = inputs.find((radio) => radio.checked)
      if (!checkedInput) throw new Error('cannot do updateOptions in variant-radios, no checked input found');
      return checkedInput.value;
    });
  }
}
