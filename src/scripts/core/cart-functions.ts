import { qsOptional, qsRequired, qsRequiredFromDocument } from '@/scripts/core/global'
import { CartNotification } from '@/scripts/theme/cart-notification'
import { CartDrawer } from '@/scripts/cart/cart-drawer'
import { ModalDialog } from '@/scripts/theme/modal-dialog'
import type { CartItem, Cart, CartErrorResponse, ProductVariant } from '@/scripts/shopify'

// TODO: next steps on refactor
// - finish up debugging current changes in cart notification and cart page
// - check quick add modal stuff to see if anything needs to be moved around
// - look into making the 'handleError' a callback that's passed in - i.e. the caller gets to decide what happens on error, or let drawer handle as default
type SectionsResponse = Record<string, string>

type CartAdd = {
	items: CartItem[]
}

export type CartAddWithSections = CartAdd & {
	sections: SectionsResponse
}

export type CartUpdateWithSections = Cart & {
	sections: SectionsResponse
}

export async function getCart(): Promise<Cart | CartErrorResponse> {
	try {
		const cart = await fetch('/cart.js', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => response.json())
		if (cart.status) {
			return cart as CartErrorResponse
		}
		return cart as Cart
	} catch (error) {
		console.error(error)
		return {
			status: 500,
			description: 'Error in HTTP request',
			message:
				'This cart operation failed, but Shopify did not return an error',
		}
	}
}

export function getDOMCart() {
	return (
		qsOptional<CartNotification>(CartNotification.htmlSelector) ??
		qsOptional<CartDrawer>(CartDrawer.htmlSelector)
	)
}

export function hasDomCart() {
	return getDOMCart() !== undefined
}

export function getDOMCartSectionApiIds() {
	const cartEl = getDOMCart()
	if (!cartEl) return undefined
	return cartEl.sectionApiIds
}

const ignoredProperties = ['utf8', 'product-id']

export function renderResponseToCartDrawer(
	cart: CartAddWithSections | CartUpdateWithSections | CartAdd,
	modal?: ModalDialog
) {
	if (modal) {
		document.body.addEventListener(
			'modalClosed',
			() => {
				setTimeout(() => {
					renderResponseToCartDrawer(cart)
				})
			},
			{ once: true }
		)
		modal.hide(true)
		return
	}

	const cartEl = getDOMCart()

	if (!cartEl) {
		window.location.href = window.routes.cart_url
		return
	}

	if ('sections' in cart) {
		cartEl.renderContents(cart)
	}
}

function createAddToCartInputFromFormData(
	formData: FormData,
	sections?: string[]
): AddToCartInput {
	const properties: Record<string, string> = {}
	let id: number | undefined = undefined
	let quantity: number | undefined = undefined
	let selling_plan: number | undefined = undefined
	let form_type: string | undefined = undefined
	for (let [key, value] of formData.entries()) {
		if (value instanceof File) continue
		switch (key) {
			case 'id':
				id = parseInt(value)
				break
			case 'quantity':
				quantity = parseInt(value)
				break
			case 'form_type':
				form_type = value
				break
			case 'selling_plan':
				selling_plan = parseInt(value)
				break
			default:
				if (
					!ignoredProperties.includes(key) &&
					!key.includes('options[')
				) {
					properties[key] = value.toString()
				}
		}
	}
	if (!id) throw Error('No variant id found')
	if (!quantity) quantity = 1
	if (!form_type) throw Error('No form type found')
	const item: AddToCartItem = {
		id,
		quantity,
		properties,
	}

	if (selling_plan) {
		item.selling_plan = selling_plan
	}

	if (sections && sections.length) {
		return {
			items: [item],
			form_type,
			sections,
		}
	} else {
		return {
			items: [item],
			form_type,
		}
	}
}

type AddToCartItem = {
	id: number
	quantity: number
	selling_plan?: number
	properties: Record<string, string>
}

type AddToCartInput = {
	items: AddToCartItem[]
	form_type: string
	sections?: string[]
	sections_url?: string
}

type RenderRawHTMLToDOMInput = {
	sourceHTML: string
	sourceSelector?: string
	destinationSelectorContainer?: string
	destinationSelector: string
}

export function renderRawHTMLToDOM({
	sourceHTML,
	sourceSelector,
	destinationSelector,
	destinationSelectorContainer,
}: RenderRawHTMLToDOMInput) {
	const sourceSelectorOrDefault = sourceSelector ?? '.shopify-section'
	const newDocument = new DOMParser().parseFromString(sourceHTML, 'text/html')
	const sourceElement = qsRequired(
		sourceSelectorOrDefault,
		newDocument.documentElement
	)
	if (destinationSelectorContainer) {
		const container = qsRequired(destinationSelectorContainer)
		const destinationElement = qsRequired(destinationSelector, container)
		destinationElement.outerHTML = sourceElement.outerHTML
	} else {
		const destinationElement = qsRequired(destinationSelector)
		destinationElement.outerHTML = sourceElement.outerHTML
	}
}

export function configPostRequest(data: unknown) {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: `application/json`,
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify(data),
	}
}

export async function addItemsToCart(
	input: AddToCartItem[] | FormData,
	sections?: string[]
): Promise<CartAdd | CartAddWithSections | CartErrorResponse> {
	// TO
	const data =
		input instanceof FormData
			? createAddToCartInputFromFormData(input, sections)
			: sections && sections.length
				? {
						items: input,
						sections: sections,
					}
				: {
						items: input,
					}

	try {
		const response = await fetch(
			`${window.routes.cart_add_url}`,
			configPostRequest(data)
		)
		const cart = await response.json()
		if (cart.status) {
			return cart as CartErrorResponse
		}
		if (sections) {
			return cart as CartAddWithSections
		} else {
			return cart as CartAdd
		}
	} catch (error) {
		console.error(error)
		return {
			status: 500,
			description: 'Error in HTTP request',
			message:
				'This cart operation failed, but Shopify did not return an error',
		}
	}
}

type CartUpdateByKeyItem = {
	key: string
	quantity: number
}

type CartUpdateByIdItem = {
	id: number
	quantity: number
}

export async function updateCartRequest(
	newItems: CartUpdateByIdItem[],
	existingItems: CartUpdateByKeyItem[],
	sections?: string[]
) {
	const updates: Record<number | string, number> = {}
	newItems.forEach((item) => {
		updates[item.id] = item.quantity
	})
	existingItems.forEach((item) => {
		updates[item.key] = item.quantity
	})
	const data =
		sections && sections.length
			? {
					updates,
					sections,
				}
			: {
					updates,
				}

	try {
		const response = await fetch(
			`${window.routes.cart_update_url}`,
			configPostRequest(data)
		)
		const cart = await response.json()
		if (cart.status) {
			return cart as CartErrorResponse
		}
		return cart as Cart
	} catch (error) {
		console.error(error)
		return {
			status: 500,
			description: 'Error in HTTP request',
			message:
				'This cart operation failed, but Shopify did not return an error',
		}
	}
}

export type ShopifyProductOptions = {
	option1: string
	option2?: string
	option3?: string
}

export function variantFromProductOptions(
	options: ShopifyProductOptions,
	variants: ProductVariant[]
): ProductVariant {
	const variant = variants.find((variant) => {
		if (variant.option1 !== options.option1) return false
		if (options.option2 && variant.option2 !== options.option2) return false
		if (options.option3 && variant.option3 !== options.option3) return false
		return true
	})
	if (!variant) throw Error('No variant found')
	return variant
}

export async function getSectionHTMLForResource(
	url: string,
	sectionId: string,
): Promise<string | undefined> {
	try {
		return await fetch(`${url}?sections=${sectionId}`)
			.then((response) => {
				return response.json()
			})
			.then((response) => {
				const html = response[sectionId]
				const parser = new DOMParser()
				const doc = parser.parseFromString(html, 'text/html')
				return qsRequiredFromDocument('.shopify-section', doc).innerHTML
			})
	} catch (e) {
		console.error('error in getSectionHTMLForResource')
		console.log(e)
	}
}

export function getActiveOrAccessibilityElement(): HTMLElement {
	const activeElement = document.activeElement
	if (activeElement instanceof HTMLElement) {
		return activeElement
	} else {
		return qsRequired('[data-uc-accessibility-focus]')
	}
}
