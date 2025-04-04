import { TsDOM as q } from '@/scripts/core/TsDOM'
import { CartNotification } from '@/scripts/theme/cart-notification'
import { CartDrawer } from '@/scripts/cart/cart-drawer'
import { ModalDialog } from '@/scripts/theme/modal-dialog'
import type {
	CartItem,
	Cart,
	CartErrorResponse,
	ProductVariant,
} from '@/scripts/shopify'
import { type DynamicProgressBar } from '@/scripts/cart/dynamic-progress-bar'

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

export type CartUpdateInstructions = {
	updates: Record<number, number> | Record<string, number>
	update_required: boolean
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
		q.os<CartNotification>(CartNotification.htmlSelector) ??
		q.os<CartDrawer>(CartDrawer.htmlSelector)
	)
}

export function hasDomCart() {
	return getDOMCart() !== undefined
}

export function getDOMCartSectionApiIds() {
	const cartEl = getDOMCart()
	if (!cartEl) return undefined
	return [
		'cart-drawer-items',
		'cart-icon-bubble',
		'dynamic-progress-bar',
		'dynamic-cart-footer',
		'cart-update-instructions',
	]
}

const ignoredProperties = ['utf8', 'product-id', 'section-id']

export function updateProgressBar(rawHTML: string) {
	console.log('dynamic-progress-bar')
	const shippingBar = q.os<DynamicProgressBar>('dynamic-progress-bar')
	if (!shippingBar) return
	shippingBar.animateFromRawHTML(rawHTML)
}

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
	const sourceElement = q.rs(
		sourceSelectorOrDefault,
		newDocument.documentElement
	)
	if (destinationSelectorContainer) {
		const container = q.rs(destinationSelectorContainer)
		const destinationElement = q.rs(destinationSelector, container)
		destinationElement.outerHTML = sourceElement.outerHTML
	} else {
		const destinationElement = q.rs(destinationSelector)
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
				: { items: input }
	console.log({ data })
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
	sectionId: string
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
				return q.rs('.shopify-section', doc).innerHTML
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
		return q.rs('[data-uc-accessibility-focus]')
	}
}

export function getUpdateInstructions(
	cart: CartAddWithSections | CartUpdateWithSections
): CartUpdateInstructions {
	try {
		const responseHTML = cart.sections['cart-update-instructions']
		const newDocument = new DOMParser().parseFromString(
			responseHTML,
			'text/html'
		)
		const json = q.rs<HTMLScriptElement>(
			'[data-cart-update-instructions]',
			newDocument.documentElement
		).textContent
		console.log('cart instructions', json)
		if (json === null) {
			throw new Error(
				'Cart instruction script element found, but json content is null'
			)
		}
		const body = JSON.parse(json)
		if (
			'update_required' in body &&
			typeof body.update_required === 'boolean' &&
			'updates' in body &&
			typeof body.updates === 'object'
		) {
			return body
		}
		throw new Error(
			`Cart instruction script element found, but json content is not as expected. Expected {update_required: boolean, updates: object}, got ${json}`
		)
	} catch (e) {
		console.log(
			'error retrieving cart update instructions, returning default'
		)
		console.error(e)
		return {
			update_required: false,
			updates: {},
		}
	}
}
