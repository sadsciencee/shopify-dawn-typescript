import { TsDOM as q, debounce } from '@/scripts/core/TsDOM'
import { initializeScrollAnimationTrigger } from '@/scripts/theme/animations'
import { type MenuDrawer } from '@/scripts/theme/menu-drawer'
import { type ShopifySectionRenderingSchema } from '@/scripts/types/theme'
import { UcoastEl } from '@/scripts/core/UcoastEl'
import { ATTRIBUTES } from '@/scripts/core/global'
import { mediaLoader } from '@/scripts/core/global';

type FilterDataType = { html: string; url: string }

export class FacetFiltersForm extends UcoastEl {
	static htmlSelector = 'facet-filters-form'
	static selectors = {
		desktopWrapper: '[data-uc-facet-wrapper-desktop]',
		form: '[data-uc-facet-form]',
		productGrid: '#ProductGridContainer',
		productGridCollection: '[data-uc-product-grid-collection]',
		productCount: '#ProductCount',
		productCountDesktop: '#ProductCountDesktop',
		activeFacetsMobile: '[data-uc-facets-active="mobile"]',
		activeFacetsDesktop: '[data-uc-facets-active="desktop"]',
		jsFilter: '[data-uc-js-filter]',
		mobileElements: [
			'[data-uc-facet-mobile="open"]',
			'[data-uc-facet-mobile="count"]',
			'[data-uc-facet-mobile="sorting"]',
		],
		selected: '[data-uc-facet-selected]',
		summary: '[data-uc-facet-summary]',
		// specific types of forms
		desktopForm: '[data-uc-facet-form="desktop"]',
		pillsForm: '[data-uc-facet-form="pills"]',
		sortForm: '[data-uc-facet-form="sort"]',
		mobileForm: '[data-uc-facet-form="mobile"]',
		sortDrawerForm: '[data-uc-facet-form="sort-drawer"]',
	}
	static filterData: FilterDataType[] = []
	static searchParamsInitial: string = window.location.search.slice(1)
	static searchParamsPrev: string = window.location.search.slice(1)
	static searchPathInitial: string = window.location.pathname
	static searchPathPrev: string = window.location.pathname
	static getProductGridContainer: () => HTMLElement = () =>
		qsRequired(FacetFiltersForm.selectors.productGrid)
	debouncedOnSubmit: (event: Event) => void
	facetForm: HTMLFormElement

	constructor() {
		super()
		this.onActiveFilterClick = this.onActiveFilterClick.bind(this)

		this.debouncedOnSubmit = debounce((event: Event) => {
			this.onSubmitHandler(event)
		}, 500)

		this.facetForm = qsRequired(FacetFiltersForm.selectors.form, this)
		this.facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this))

		qsOptional(FacetFiltersForm.selectors.desktopWrapper, this)?.addEventListener(
			'keyup',
			onKeyUpEscape
		)
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
		// TODO: there are no elements with this selector, this might be legacy
		document.querySelectorAll('.js-facet-remove').forEach((element) => {
			element.classList.toggle('disabled', disable)
		})
	}

	static renderPage(searchParams: string, event: Event | null = null, updateURLHash = true) {
		FacetFiltersForm.searchParamsPrev = searchParams
		const sections = FacetFiltersForm.getSections()
		const countContainer = qsOptional(FacetFiltersForm.selectors.productCount)
		const countContainerDesktop = qsOptional(FacetFiltersForm.selectors.productCountDesktop)
		const collection = qsRequired(
			FacetFiltersForm.selectors.productGridCollection,
			FacetFiltersForm.getProductGridContainer()
		)
		collection.setAttribute(ATTRIBUTES.loading, '')
		countContainer?.setAttribute(ATTRIBUTES.loading, '')
		countContainerDesktop?.setAttribute(ATTRIBUTES.loading, '')

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
			mediaLoader()
		}

		// TODO: would like scroll triggers to be a data attribute
		const scrollTriggers = qsaOptional('.scroll-trigger', productGridContainer)
		if (!scrollTriggers) return

		scrollTriggers.forEach((element) => {
			element.classList.add('scroll-trigger--cancel')
		})
	}

	static renderProductCount(html: string) {
		const newDocument = new DOMParser().parseFromString(html, 'text/html')
		const count =
			qsOptional(FacetFiltersForm.selectors.productCount, newDocument.documentElement)
				?.innerHTML ?? 'No Results'
		const container = qsOptional(FacetFiltersForm.selectors.productCount)
		if (container) {
			container.innerHTML = count
			container.removeAttribute(ATTRIBUTES.loading)
		}
		const containerDesktop = qsOptional(FacetFiltersForm.selectors.productCountDesktop)

		if (containerDesktop) {
			containerDesktop.innerHTML = count
			containerDesktop.removeAttribute(ATTRIBUTES.loading)
		}
	}

	static renderFilters(html: string, event: Event | null) {
		const parsedHTML = new DOMParser().parseFromString(html, 'text/html')

		const facetDetailsElements = qsaOptional(FacetFiltersForm.selectors.jsFilter, parsedHTML)
		const matchesIndex = (element: HTMLElement) => {
			if (!event) return false
			const jsFilter = targetClosestOptional(event, FacetFiltersForm.selectors.jsFilter)
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
			const elementToUpdate = qsRequired(
				`${FacetFiltersForm.selectors.jsFilter}[data-index="${element.dataset.index}"]`
			)
			elementToUpdate.innerHTML = element.innerHTML
		})

		FacetFiltersForm.renderActiveFacets(parsedHTML)
		FacetFiltersForm.renderAdditionalElements(parsedHTML)

		if (countsToRender && event) {
			const target = targetClosestRequired(event, FacetFiltersForm.selectors.jsFilter)
			FacetFiltersForm.renderCounts(countsToRender, target)
		}
	}

	static renderActiveFacets(html: Document) {
		const activeFacetElementSelectors = [
			FacetFiltersForm.selectors.activeFacetsMobile,
			FacetFiltersForm.selectors.activeFacetsDesktop,
		]

		activeFacetElementSelectors.forEach((selector: string) => {
			const activeFacetsElement = html.querySelector(selector)
			if (!activeFacetsElement) return
			const facetsElementToUpdate = qsRequired(selector)
			facetsElementToUpdate.innerHTML = activeFacetsElement.innerHTML
		})

		FacetFiltersForm.toggleActiveFacets(false)
	}

	static renderAdditionalElements(html: Document) {
		FacetFiltersForm.selectors.mobileElements.forEach((selector) => {
			const newElement = qsOptional(selector, html)
			const elementToUpdate = qsOptional(selector)
			if (!newElement || !elementToUpdate) return
			elementToUpdate.innerHTML = newElement.innerHTML
		})

		const mobileFacets = qsRequired(FacetFiltersForm.selectors.mobileForm)
		const menuDrawer = closestRequired<MenuDrawer>(mobileFacets, 'menu-drawer')
		if (!menuDrawer) throw new Error('menu-drawer not found, cant close mobile facets')
		menuDrawer.onReload()
	}

	static renderCounts(source: HTMLElement, target: HTMLElement) {
		const targetElement = qsOptional(FacetFiltersForm.selectors.selected, target)
		const sourceElement = qsOptional(FacetFiltersForm.selectors.selected, source)
		const targetElementAccessibility = qsOptional(FacetFiltersForm.selectors.summary, target)
		const sourceElementAccessibility = qsOptional(FacetFiltersForm.selectors.summary, source)

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
		// this is only really necessary bc typescript -> parse form data into string array in shopify filter param format
		const paramsArr: Record<string, string>[] = []
		formData.forEach((value, key: string) => {
			paramsArr.push({
				key,
				value: value.toString(),
			})
		})
		const paramsString = paramsArr.map((param) => `${param.key}=${param.value}`).join('&')
		// back to normal dawn here
		return new URLSearchParams(paramsString).toString()
	}

	onSubmitForm(searchParams: string, event: Event) {
		FacetFiltersForm.renderPage(searchParams, event)
	}

	onSubmitHandler(event: Event) {
		event.preventDefault()
		const sortFilterForms = qsaRequired<HTMLFormElement>(FacetFiltersForm.selectors.form)
		const internetExplorerSrc = event.srcElement ? (event.srcElement as HTMLElement) : undefined
		if (internetExplorerSrc && internetExplorerSrc.className == 'mobile-facets__checkbox') {
			const form = targetClosestRequired<Event, HTMLFormElement>(
				event,
				FacetFiltersForm.selectors.form
			)
			const searchParams = this.createSearchParams(form)
			this.onSubmitForm(searchParams, event)
		} else {
			const forms: string[] = []
			const isMobile =
				targetClosestOptional<Event, HTMLFormElement>(
					event,
					FacetFiltersForm.selectors.form
				)?.getAttribute('data-uc-facet-form') === 'mobile'

			sortFilterForms.forEach((form) => {
				const formType = getAttributeOrThrow('data-uc-facet-form', form)
				if (!isMobile) {
					if (
						formType === 'sort' ||
						formType === 'desktop' ||
						formType === 'sort-drawer'
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
