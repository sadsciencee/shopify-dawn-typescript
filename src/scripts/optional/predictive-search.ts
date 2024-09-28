import { SearchForm } from '@/scripts/theme/search-form'
import { TsDOM as q } from '@/scripts/core/TsDOM'
import { ATTRIBUTES, SELECTORS } from '@/scripts/core/global';

export class PredictiveSearch extends SearchForm {
	static override htmlSelector = 'predictive-search'
	cachedResults: Record<string, string>
	predictiveSearchResults: HTMLElement
	allPredictiveSearchInstances: NodeListOf<PredictiveSearch>
	isOpen: boolean
	abortController: AbortController
	searchTerm: string
	statusElement?: HTMLElement
	loadingText?: string
	resultsMaxHeight?: number | boolean
	constructor() {
		super()
		this.cachedResults = {}
		this.predictiveSearchResults = q.rs('[data-predictive-search]', this)
		this.allPredictiveSearchInstances = q.rl<PredictiveSearch>('predictive-search')
		this.isOpen = false
		this.abortController = new AbortController()
		this.searchTerm = ''

		this.setupEventListeners()
	}

	setupEventListeners() {
		this.form.addEventListener('submit', this.onFormSubmit.bind(this))

		this.input.addEventListener('focus', this.onFocus.bind(this))
		this.addEventListener('focusout', this.onFocusOut.bind(this))
		this.addEventListener('keyup', this.onKeyup.bind(this))
		this.addEventListener('keydown', this.onKeydown.bind(this))
	}

	getQuery() {
		return this.input.value.trim()
	}

	override onChange() {
		super.onChange()
		const newSearchTerm = this.getQuery()
		if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
			// Remove the results when they are no longer relevant for the new search term
			// so they don't show up when the dropdown opens again
			this.querySelector('#predictive-search-results-groups-wrapper')?.remove()
		}

		// Update the term asap, don't wait for the predictive search query to finish loading
		this.updateSearchForTerm(this.searchTerm, newSearchTerm)

		this.searchTerm = newSearchTerm

		if (!this.searchTerm.length) {
			this.close(true)
			return
		}

		this.getSearchResults(this.searchTerm)
	}

	onFormSubmit(event: Event) {
		if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a'))
			event.preventDefault()
	}

	override onFormReset(event: Event) {
		super.onFormReset(event)
		if (super.shouldResetForm()) {
			this.searchTerm = ''
			this.abortController.abort()
			this.abortController = new AbortController()
			this.closeResults(true)
		}
	}

	onFocus() {
		const currentSearchTerm = this.getQuery()

		if (!currentSearchTerm.length) return

		if (this.searchTerm !== currentSearchTerm) {
			// Search term was changed from other search input, treat it as a user change
			this.onChange()
		} else if (this.getAttribute('results') === 'true') {
			this.open()
		} else {
			this.getSearchResults(this.searchTerm)
		}
	}

	onFocusOut() {
		setTimeout(() => {
			if (!this.contains(document.activeElement)) this.close()
		})
	}

	onKeyup(event: KeyboardEvent) {
		if (!this.getQuery().length) this.close(true)
		event.preventDefault()

		switch (event.code) {
			case 'ArrowUp':
				this.switchOption('up')
				break
			case 'ArrowDown':
				this.switchOption('down')
				break
			case 'Enter':
				this.selectOption()
				break
		}
	}

	onKeydown(event: KeyboardEvent) {
		// Prevent the cursor from moving in the input when using the up and down arrow keys
		if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
			event.preventDefault()
		}
	}

	updateSearchForTerm(previousTerm: string, newTerm: string) {
		const searchForTextElement = q.os('[data-predictive-search-search-for-text]', this)
		if (!searchForTextElement) return
		const currentButtonText = searchForTextElement.innerText
		if (!currentButtonText) return
		const regex = new RegExp(previousTerm, 'g')
		if (regex === null) return
		if (currentButtonText.match(regex)?.length ?? 0 > 1) {
			console.warn(
				'The search term is used more than once in the button text, do not replace to avoid mistakes'
			)
			// The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
			return
		}
		const newButtonText = currentButtonText.replace(previousTerm, newTerm)
		searchForTextElement.innerText = newButtonText
	}

	switchOption(direction: 'up' | 'down') {
		if (!this.getAttribute('open')) return

		const moveUp = direction === 'up'
		const selectedElement = this.querySelector('[aria-selected="true"]')

		// Filter out hidden elements (duplicated page and article resources) thanks
		// to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
		// TODO: not sure about this assignemnt so check here if buggy
		const allVisibleElementsNodes =
			q.ol('li, button.predictive-search__item', this) ?? []
		const allVisibleElements = Array.from(allVisibleElementsNodes).filter(
			(element) => element.offsetParent !== null
		)
		let activeElementIndex = 0

		if (moveUp && !selectedElement) return

		let selectedElementIndex = -1
		let i = 0

		while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
			if (allVisibleElements[i] === selectedElement) {
				selectedElementIndex = i
			}
			i++
		}

		if (!this.statusElement)
			throw new Error('switchOption called too early - statusElement not set')

		this.statusElement.textContent = ''

		if (!moveUp && selectedElement) {
			activeElementIndex =
				selectedElementIndex === allVisibleElements.length - 1
					? 0
					: selectedElementIndex + 1
		} else if (moveUp) {
			activeElementIndex =
				selectedElementIndex === 0
					? allVisibleElements.length - 1
					: selectedElementIndex - 1
		}

		if (activeElementIndex === selectedElementIndex) return

		const activeElement = allVisibleElements[activeElementIndex]

		activeElement.setAttribute('aria-selected', 'true')
		if (selectedElement) selectedElement.setAttribute('aria-selected', 'false')

		this.input.setAttribute('aria-activedescendant', activeElement.id)
	}

	selectOption() {
		const selectedOption = q.rs<HTMLButtonElement | HTMLAnchorElement>(
			'[aria-selected="true"] a, button[aria-selected="true"]',
			this
		)

		if (selectedOption) selectedOption.click()
	}

	getSearchResults(searchTerm: string) {
		const queryKey = searchTerm.replace(' ', '-').toLowerCase()
		this.setLiveRegionLoadingState()

		if (this.cachedResults[queryKey]) {
			this.renderSearchResults(this.cachedResults[queryKey])
			return
		}

		fetch(
			`${window.routes.predictive_search_url}?q=${encodeURIComponent(
				searchTerm
			)}&section_id=predictive-search`,
			{
				signal: this.abortController.signal,
			}
		)
			.then((response) => {
				if (!response.ok) {
					const error = new Error(`${response.status}`)
					this.close()
					throw error
				}

				return response.text()
			})
			.then((text) => {
				const newDocument = new DOMParser().parseFromString(text, 'text/html')
				const resultsMarkup = q.rs(
					'#shopify-section-predictive-search',
					newDocument.documentElement
				).innerHTML
				// Save bandwidth keeping the cache in all instances synced
				this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
					predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup
				})
				this.renderSearchResults(resultsMarkup)
			})
			.catch((error) => {
				if (error?.code === 20) {
					// Code 20 means the call was aborted
					return
				}
				this.close()
				throw error
			})
	}

	setLiveRegionLoadingState() {
		this.statusElement = this.statusElement || q.rs('.predictive-search-status', this)
		this.loadingText = this.loadingText || getAttributeOrThrow('data-loading-text', this)

		this.setLiveRegionText(this.loadingText)
		this.setAttribute(ATTRIBUTES.loading, '')
	}

	setLiveRegionText(statusText: string) {
		if (!this.statusElement)
			throw new Error('setLiveRegionText called to early - this.statusElement is not defined')
		this.statusElement.setAttribute('aria-hidden', 'false')
		this.statusElement.textContent = statusText

		setTimeout(() => {
			if (!this.statusElement) throw new Error('this.statusElement removed before timeout')
			this.statusElement.setAttribute('aria-hidden', 'true')
		}, 1000)
	}

	renderSearchResults(resultsMarkup: string) {
		this.predictiveSearchResults.innerHTML = resultsMarkup
		this.setAttribute('results', 'true')

		this.setLiveRegionResults()
		this.open()
	}

	setLiveRegionResults() {
		this.removeAttribute(ATTRIBUTES.loading)
		const liveRegionCountEl = q.os('[data-predictive-search-live-region-count]', this)
		this.setLiveRegionText(liveRegionCountEl?.textContent ?? '')
	}

	getResultsMaxHeight() {
		const header = q.rs(SELECTORS.sectionHeader)
		this.resultsMaxHeight = window.innerHeight - header.getBoundingClientRect().bottom
		return this.resultsMaxHeight
	}

	open() {
		this.predictiveSearchResults.style.maxHeight =
			`${this.resultsMaxHeight}px` || `${this.getResultsMaxHeight()}px`
		this.setAttribute('open', 'true')
		this.input.setAttribute('aria-expanded', 'true')
		this.isOpen = true
	}

	close(clearSearchTerm = false) {
		this.closeResults(clearSearchTerm)
		this.isOpen = false
	}

	closeResults(clearSearchTerm = false) {
		if (clearSearchTerm) {
			this.input.value = ''
			this.removeAttribute('results')
		}
		const selected = this.querySelector('[aria-selected="true"]')

		if (selected) selected.setAttribute('aria-selected', 'false')

		this.input.setAttribute('aria-activedescendant', '')
		this.removeAttribute(ATTRIBUTES.loading)
		this.removeAttribute('open')
		this.input.setAttribute('aria-expanded', 'false')
		this.resultsMaxHeight = false
		this.predictiveSearchResults.removeAttribute('style')
	}
}
