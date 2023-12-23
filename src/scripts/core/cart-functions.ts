import { qsOptional, qsRequired } from '@/scripts/core/global'
import { routes } from '@/scripts/setup'
import { CartNotification } from '@/scripts/theme/cart-notification'
import { CartDrawer } from '@/scripts/cart/cart-drawer'
import { QuickAddModal } from '@/scripts/optional/quick-add'
import { ModalDialog } from '@/scripts/theme/modal-dialog'

// TODO: next steps on refactor
// - finish up debugging current changes in cart notification and cart page
// - check quick add modal stuff to see if anything needs to be moved around
// - look into making the 'handleError' a callback that's passed in - i.e. the caller gets to decide what happens on error, or let drawer handle as default

type SectionsResponse = Record<string, string>

export type CartErrorResponse = {
	status: number
	errors?: string | string[] | { [key: string]: string[] }
	description: string
	message: string
}

type Cart = {
	token: string
	note: string | null
	attributes: Record<string, string>
	original_total_price: number
	total_price: number
	total_discount: number
	total_weight: number
	item_count: number
	items: CartItem[]
	requires_shipping: boolean
	currency: string
	items_subtotal_price: number
	cart_level_discount_applications: DiscountApplication[]
}

type CartItem = {
	id: number
	properties: Record<string, any>
	quantity: number
	variant_id: number
	key: string
	title: string
	price: number
	original_price: number
	discounted_price: number
	line_price: number
	original_line_price: number
	total_discount: number
	discounts: Discount[]
	sku: string
	grams: number
	vendor: string
	taxable: boolean
	product_id: number
	product_has_only_default_variant: boolean
	gift_card: boolean
	final_price: number
	final_line_price: number
	url: string
	featured_image: FeaturedImage
	image: string
	handle: string
	requires_shipping: boolean
	product_type: string
	product_title: string
	product_description: string
	variant_title: string | null
	variant_options: string[]
	options_with_values: OptionWithValue[]
	line_level_discount_allocations: DiscountAllocation[]
	line_level_total_discount: number
	quantity_rule: QuantityRule
	has_components: boolean
	selling_plan_allocation?: SellingPlanAllocation
	unit_price?: number
	unit_price_measurement?: UnitPriceMeasurement
}

type Discount = {
	amount: number
	title: string
}

type FeaturedImage = {
	aspect_ratio: number
	alt: string
	height: number
	url: string
	width: number
}

type OptionWithValue = {
	name: string
	value: string
}

type DiscountApplication = {
	type: string
	key: string
	title: string
	description: string
	value: string
	created_at: string
	value_type: string
	allocation_method: string
	target_selection: string
	target_type: string
	total_allocated_amount: number
}

type DiscountAllocation = {
	amount: number
	discount_application: DiscountApplication
}

type QuantityRule = {
	min: number
	max: number | null
	increment: number
}

type SellingPlanAllocation = {
	price_adjustments: PriceAdjustment[]
	price: number
	compare_at_price: number
	per_delivery_price: number
	selling_plan: SellingPlan
}

type PriceAdjustment = {
	position: number
	price: number
}

type SellingPlan = {
	id: number
	name: string
	description: string | null
	options: SellingPlanOption[]
	recurring_deliveries: boolean
	fixed_selling_plan: boolean
	price_adjustments: SellingPlanPriceAdjustment[]
}

type SellingPlanOption = {
	name: string
	position: number
	value: string
}

type SellingPlanPriceAdjustment = {
	order_count: number | null
	position: number
	value_type: string
	value: number
}

type UnitPriceMeasurement = {
	measured_type: string
	quantity_value: string
	quantity_unit: string
	reference_value: number
	reference_unit: string
}

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
		window.location = window.routes.cart_url
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
	let form_type: string | undefined = undefined
	for (let [key, value] of formData.entries()) {
		console.log(key, value)
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
	if (sections && sections.length) {
		return {
			items: [
				{
					id,
					quantity,
					properties,
				},
			],
			form_type,
			sections,
		}
	} else {
		return {
			items: [
				{
					id,
					quantity,
					properties,
				},
			],
			form_type,
		}
	}
}

type AddToCartItem = {
	id: number
	quantity: number
	properties: Record<string, string>
}

type AddToCartInput = {
	items: AddToCartItem[]
	form_type: string
	sections?: string[]
	sections_url?: string
}

export function getSectionInnerHTML(
	html: string,
	selector = '.shopify-section'
) {
	const newDocument = new DOMParser().parseFromString(html, 'text/html')
	const newSection = qsRequired(selector, newDocument.documentElement)
	return newSection.innerHTML
}

export function sectionSelectorFromId(id: string) {
	return `#shopify-section-${id}`
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
	console.log({
		sourceSelectorOrDefault,
	})
	const newDocument = new DOMParser().parseFromString(sourceHTML, 'text/html')
	console.log({
		newDocument,
	})
	const sourceElement = qsRequired(
		sourceSelectorOrDefault,
		newDocument.documentElement
	)
	console.log({
		sourceElement,
	})
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
	// TODO: real talk I think the whole form data parse this is a waste of time - like, 90% sure shopify just does this #natty
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
			`${routes.cart_add_url}`,
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

export async function removeItemFromCart() {}

export async function updateQuantityByLineKey() {}

export async function upsertCartItems() {}
