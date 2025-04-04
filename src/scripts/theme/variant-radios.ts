import { VariantSelects } from '@/scripts/theme/variant-selects';
import { TsDOM as q } from '@/scripts/core/TsDOM'

export class VariantRadios extends VariantSelects {
  static override htmlSelector = 'variant-radios';
  static override selectors = {
    ...VariantSelects.selectors,
  }
  constructor() {
    super();
  }

  override setInstanceSelectors() {
    this.instanceSelectors = VariantRadios.selectors
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
    const fieldsetNodes = q.ol<HTMLFieldSetElement>('fieldset', this);
    if (!fieldsetNodes) throw new Error('cannot do updateOptions in variant-radios, no fieldset nodes found');
    const fieldsets = Array.from(fieldsetNodes);
    this.options = fieldsets.map((fieldset) => {
      const inputNodes = q.ol<HTMLInputElement>('input', fieldset);
      if (!inputNodes) throw new Error('cannot do updateOptions in variant-radios, no input nodes found');
      const inputs = Array.from(inputNodes);
      const checkedInput = inputs.find((radio) => radio.checked)
      if (!checkedInput) throw new Error('cannot do updateOptions in variant-radios, no checked input found');
      return checkedInput.value;
    });
  }
}
