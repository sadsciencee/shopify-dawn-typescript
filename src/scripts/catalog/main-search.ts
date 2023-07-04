import { SearchForm } from '@/scripts/theme/search-form';
import { qsaRequired, targetRequired } from '@/scripts/functions';

export class MainSearch extends SearchForm {
  static override htmlSelector = 'main-search';
  allSearchInputs: NodeListOf<HTMLInputElement>;
  constructor() {
    super();
    this.allSearchInputs = qsaRequired('input[type="search"]')
    this.setupEventListeners();
  }

  setupEventListeners() {
    let allSearchForms:HTMLFormElement[] = [];
    this.allSearchInputs.forEach((input) => {
      if (input.form) {
        allSearchForms.push(input.form)
      } else {
        throw new Error('input in allSearchInputs is not in a form element')
      }
    });
    this.input.addEventListener('focus', this.onInputFocus.bind(this));
    if (allSearchForms.length < 2) return;
    allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
    this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
  }

  override onFormReset(event:Event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.keepInSync('', this.input);
    }
  }

  onInput(event:Event) {
    const target = targetRequired<Event, HTMLInputElement>(event);
    this.keepInSync(target.value, target);
  }

  onInputFocus() {
    const isSmallScreen = window.innerWidth < 750;
    if (isSmallScreen) {
      this.scrollIntoView({ behavior: 'smooth' });
    }
  }

  keepInSync(value:string, target:HTMLInputElement) {
    this.allSearchInputs.forEach((input) => {
      if (input !== target) {
        input.value = value;
      }
    });
  }
}
