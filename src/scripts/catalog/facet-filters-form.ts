import {
	closestRequired,
	currentTargetRequired,
	debounce,
	getAttributeOrThrow,
	onKeyUpEscape,
	qsaOptional,
	qsaRequired,
	qsOptional,
	qsRequired,
	targetClosestOptional,
	targetClosestRequired,
} from '@/scripts/functions'
import { initializeScrollAnimationTrigger } from '@/scripts/theme/animations'
import { type MenuDrawer } from '@/scripts/theme/menu-drawer'
import { type ShopifySectionRenderingSchema } from '@/scripts/types/theme'
import { UcoastEl } from '@/scripts/core/UcoastEl'

type FilterDataType = { html: string; url: string }

export class FacetFiltersForm extends UcoastEl {
	static htmlSelector = 'facet-filters-form'
	static filterData: FilterDataType[] = []
	static searchParamsInitial: string = window.location.search.slice(1)
	static searchParamsPrev: string = window.location.search.slice(1)
	static searchPathInitial: string = window.location.pathname
	static searchPathPrev: string = window.location.pathname
	static getProductGridContainer: () => HTMLElement = () => qsRequired('#ProductGridContainer')
	debouncedOnSubmit: (event: Event) => void
	facetForm: HTMLFormElement

	constructor() {
		super()
		this.onActiveFilterClick = this.onActiveFilterClick.bind(this)

		this.debouncedOnSubmit = debounce((event: Event) => {
			this.onSubmitHandler(event)
		}, 500)

		this.facetForm = qsRequired('form', this)
		this.facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this))

		const facetWrapper = qsOptional('#FacetsWrapperDesktop', this)
		if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape)
	}

	static setListeners() {
		const onHistoryChange = (event: PopStateEvent) => {
			const searchParams = event.state
				? event.state.searchParams
				: FacetFiltersForm.searchParamsInitial
			if (searchParams === FacetFiltersForm.searchParamsPrev) return
			FacetFiltersForm.renderPage(searchParams, null, false)
		}
		window.addEventListener('popstate', onHistoryChange)
	}

	static toggleActiveFacets(disable = true) {
		document.querySelectorAll('.js-facet-remove').forEach((element) => {
			element.classList.toggle('disabled', disable)
		})
	}

	static renderPage(searchParams: string, event: Event | null = null, updateURLHash = true) {
		FacetFiltersForm.searchParamsPrev = searchParams
		const sections = FacetFiltersForm.getSections()
		const countContainer = document.getElementById('ProductCount')
		const countContainerDesktop = document.getElementById('ProductCountDesktop')
		const collection = qsRequired('.collection', FacetFiltersForm.getProductGridContainer())
		collection.classList.add('loading')
		if (countContainer) {
			countContainer.classList.add('loading')
		}
		if (countContainerDesktop) {
			countContainerDesktop.classList.add('loading')
		}

		sections.forEach((section) => {
			const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`
			const filterDataUrl = (element: FilterDataType) => element.url === url

			FacetFiltersForm.filterData.some(filterDataUrl)
				? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
				: FacetFiltersForm.renderSectionFromFetch(url, event)
		})

		if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams)
	}

	static renderSectionFromFetch(url: string, event: Event | null) {
		fetch(url)
			.then((response) => response.text())
			.then((responseText) => {
				const html = responseText
				const newDocument = new DOMParser().parseFromString(html, 'text/html')
				FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }]
				FacetFiltersForm.renderFilters(html, event)
				FacetFiltersForm.renderProductGridContainer(html)
				FacetFiltersForm.renderProductCount(html)
				if (typeof initializeScrollAnimationTrigger === 'function')
					initializeScrollAnimationTrigger(newDocument.documentElement)
			})
	}

	static renderSectionFromCache(
		filterDataUrl: (element: FilterDataType) => boolean,
		event: Event | null
	) {
		const html = FacetFiltersForm.filterData.find(filterDataUrl)?.html
		if (!html) throw new Error('search filter not found in cache')
		const newDocument = new DOMParser().parseFromString(html, 'text/html')
		FacetFiltersForm.renderFilters(html, event)
		FacetFiltersForm.renderProductGridContainer(html)
		FacetFiltersForm.renderProductCount(html)
		if (typeof initializeScrollAnimationTrigger === 'function')
			initializeScrollAnimationTrigger(newDocument.documentElement)
	}

	static renderProductGridContainer(html: string) {
		const productGridContainer = FacetFiltersForm.getProductGridContainer()
		const newHTML = new DOMParser()
			.parseFromString(html, 'text/html')
			.getElementById('ProductGridContainer')?.innerHTML
		if (newHTML) {
			productGridContainer.innerHTML = newHTML
		}

		const scrollTriggers = qsaOptional('.scroll-trigger', productGridContainer)
		if (!scrollTriggers) return

		scrollTriggers.forEach((element) => {
			element.classList.add('scroll-trigger--cancel')
		})
	}

	static renderProductCount(html: string) {
		const newDocument = new DOMParser().parseFromString(html, 'text/html')
		const count = qsOptional('#ProductCount', newDocument.documentElement)?.innerHTML ?? 'No Results'
		const container = qsOptional('#ProductCount')
		if (container) {
			container.innerHTML = count
			container.classList.remove('loading')
		}
		const containerDesktop = qsOptional('#ProductCountDesktop')

		if (containerDesktop) {
			containerDesktop.innerHTML = count
			containerDesktop.classList.remove('loading')
		}
	}

	static renderFilters(html: string, event: Event | null) {
		const parsedHTML = new DOMParser().parseFromString(html, 'text/html')

		const facetDetailsElements = qsaOptional(
			'#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter',
			parsedHTML
		)
		const matchesIndex = (element: HTMLElement) => {
			if (!event) return false
			const jsFilter = targetClosestOptional(event, '.js-filter')
			if (!jsFilter) return false
			return element.dataset.index === jsFilter.dataset.index
		}
		const facetsToRender = facetDetailsElements
			? Array.from(facetDetailsElements).filter((element) => !matchesIndex(element))
			: []
		const countsToRender = facetDetailsElements
			? Array.from(facetDetailsElements).find(matchesIndex)
			: undefined

		facetsToRender.forEach((element: HTMLElement) => {
			const elementToUpdate = qsRequired(`.js-filter[data-index="${element.dataset.index}"]`)
			elementToUpdate.innerHTML = element.innerHTML
		})

		FacetFiltersForm.renderActiveFacets(parsedHTML)
		FacetFiltersForm.renderAdditionalElements(parsedHTML)

		if (countsToRender && event) {
			const target = targetClosestRequired(event, '.js-filter')
			FacetFiltersForm.renderCounts(countsToRender, target)
		}
	}

	static renderActiveFacets(html: Document) {
		const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop']

		activeFacetElementSelectors.forEach((selector: string) => {
			const activeFacetsElement = html.querySelector(selector)
			if (!activeFacetsElement) return
			const facetsElementToUpdate = qsRequired(selector)
			facetsElementToUpdate.innerHTML = activeFacetsElement.innerHTML
		})

		FacetFiltersForm.toggleActiveFacets(false)
	}

	static renderAdditionalElements(html: Document) {
		const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting']

		mobileElementSelectors.forEach((selector) => {
			const newElement = qsOptional(selector, html)
			const elementToUpdate = qsOptional(selector)
			if (!newElement || !elementToUpdate) return
			elementToUpdate.innerHTML = newElement.innerHTML
		})

		const mobileFacets = qsRequired('#FacetFiltersFormMobile')
		const menuDrawer = closestRequired<MenuDrawer>(mobileFacets, 'menu-drawer')
		if (!menuDrawer) throw new Error('menu-drawer not found, cant close mobile facets')
		menuDrawer.bindEvents()
	}

	static renderCounts(source: HTMLElement, target: HTMLElement) {
		const targetElement = qsOptional('.facets__selected', target)
		const sourceElement = qsOptional('.facets__selected', source)
		const targetElementAccessibility = qsOptional('.facets__summary', target)
		const sourceElementAccessibility = qsOptional('.facets__summary', source)

		if (sourceElement && targetElement) {
			targetElement.outerHTML = sourceElement.outerHTML
		}

		if (targetElementAccessibility && sourceElementAccessibility) {
			targetElementAccessibility.outerHTML = sourceElementAccessibility.outerHTML
		}
	}

	static updateURLHash(searchParams: string) {
		history.pushState(
			{ searchParams },
			'',
			`${window.location.pathname}${searchParams && '?'.concat(searchParams)}`
		)
	}

	static getSections(): ShopifySectionRenderingSchema[] {
		const productGrid = qsRequired('#product-grid')
		return [
			{
				section: getAttributeOrThrow('data-id', productGrid),
			},
		]
	}

	createSearchParams(form: HTMLFormElement) {
		const formData = new FormData(form)
		return new URLSearchParams(formData.toString()).toString()
	}

	onSubmitForm(searchParams: string, event: Event) {
		FacetFiltersForm.renderPage(searchParams, event)
	}

	onSubmitHandler(event: Event) {
		event.preventDefault()
		const sortFilterForms = qsaRequired<HTMLFormElement>('facet-filters-form form')
		const internetExplorerSrc = event.srcElement ? (event.srcElement as HTMLElement) : undefined
		if (internetExplorerSrc && internetExplorerSrc.className == 'mobile-facets__checkbox') {
			const form = targetClosestRequired<Event, HTMLFormElement>(event, 'form')
			const searchParams = this.createSearchParams(form)
			this.onSubmitForm(searchParams, event)
		} else {
			const forms: string[] = []
			const isMobile =
				targetClosestOptional<Event, HTMLFormElement>(event, 'form')?.id ===
				'FacetFiltersFormMobile'

			sortFilterForms.forEach((form) => {
				if (!isMobile) {
					if (
						form.id === 'FacetSortForm' ||
						form.id === 'FacetFiltersForm' ||
						form.id === 'FacetSortDrawerForm'
					) {
						const noJsElements = document.querySelectorAll('.no-js-list')
						noJsElements.forEach((el) => el.remove())
						forms.push(this.createSearchParams(form))
					}
				} else if (form.id === 'FacetFiltersFormMobile') {
					forms.push(this.createSearchParams(form))
				}
			})
			this.onSubmitForm(forms.join('&'), event)
		}
	}

	onActiveFilterClick(event: Event) {
		event.preventDefault()
		FacetFiltersForm.toggleActiveFacets()
		const currentTarget = currentTargetRequired(event)
		if (!(currentTarget instanceof HTMLAnchorElement))
			throw new Error('currentTarget is not anchor element')
		const url =
			currentTarget.href.indexOf('?') == -1
				? ''
				: currentTarget.href.slice(currentTarget.href.indexOf('?') + 1)
		FacetFiltersForm.renderPage(url)
	}
}

export function beforeFacetFiltersForm() {
	FacetFiltersForm.filterData = []
	FacetFiltersForm.searchParamsInitial = window.location.search.slice(1)
	FacetFiltersForm.searchParamsPrev = window.location.search.slice(1)
}

export function afterFacetFiltersForm() {
	FacetFiltersForm.setListeners()
}
