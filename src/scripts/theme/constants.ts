export const ON_CHANGE_DEBOUNCE_TIMER = 300

export const PUB_SUB_EVENTS = {
	cartUpdate: 'cart-update',
	quantityUpdate: 'quantity-update',
	variantChange: 'variant-change',
	cartError: 'cart-error',
}

//  common attributes. sometimes these are used as elements selectors, if the attribute is added/removed
export const ATTRIBUTES = {
	cartEmpty: 'data-uc-cart-empty',
	loading: 'data-uc-loading',
	submenu: 'data-uc-submenu',
	menuOpening: 'data-uc-menu-opening'
}

// selectors for common elements where the selector won't be added/removed
export const SELECTORS = {
	cartLink: '[data-uc-cart-icon-bubble]',
	loadingOverlay: '[data-uc-loading-overlay]',
	loadingOverlaySpinner: '[data-uc-loading-overlay-spinner]',
	sectionHeader: '.section-header',
	headerWrapper: '[data-uc-header-wrapper]',
}
