// Liquid API -> Typescript

import { string } from 'postcss-selector-parser'

export type nil = null

export type Attributes = Record<string, string>

interface FilterValue {
	active: boolean
	count: number | nil
	label: string | nil
	param_name: string
	url_to_add: string
	url_to_remove: string
	value: string
}

interface TaxLine {
	price: number
	rate: number
	rate_percentage: number
	title: string
}

interface Filter {
	active_values: FilterValue[]
	false_value: FilterValue | nil
	inactive_values: FilterValue[]
	label: string
	max_value: FilterValue | nil
	min_value: FilterValue | nil
	param_name: string
	range_max: number | nil
	true_value: FilterValue | nil
	type: 'boolean' | 'list' | 'price_range'
	url_to_remove: string
	values: FilterValue[]
}

interface Collection {
	all_products_count: number
	all_tags: string[]
	all_types: string[]
	all_vendors: string[]
	current_type: string
	current_vendor: string | nil
	default_sort_by:
		| 'manual'
		| 'best-selling'
		| 'title-ascending'
		| 'price-ascending'
		| 'price-descending'
		| 'created-ascending'
		| 'created-descending'
	description: string
	featured_image: Image
	filters: Filter[]
	handle: string
	id: number
	image: Image
	metafields: any
	next_product: Product | nil
	previous_product: Product | nil
	products: Product[]
	products_count: number
	published_at: string
	sort_by: string
	sort_options: {
		name: string
		value: string
	}[]
	tags: string[]
	template_suffix: string
	title: string
	url: string
}

interface UnitPriceMeasurement {
	measured_type: 'volume' | 'weight' | 'dimension'
	quantity_value: number
	quantity_unit: string
	reference_value: number
	reference_unit: 'kg'
}

interface SellingPlanCheckoutCharge {
	value: number
	value_type: 'percentage' | 'price'
}

interface Currency {
	iso_code: string
	name: string
	symbol: string
}

interface Measurement {
	type: 'dimension' | 'volume' | 'weight'
	volume: string
	value: number
}

interface Market {
	handle: string
	id: string
	metafields: any
}

interface Country {
	currency: Currency
	iso_code: string
	market: Market
	name: string
	unit_system: 'metric' | 'imperial'
}

interface Address {
	address1: string
	address2: string
	city: string
	company: string
	country: Country
	country_code: string
	first_name: string | nil
	id: number
	last_name: string | nil
	name: string
	phone: string
	province: string
	province_code: string
	street: string
	summary: string
	url: string
	zip: string
}

interface Location {
	address: {}
	id: number
	latitude: number
	longitude: number
	metafields: any
	name: string
}

interface StoreAvailability {
	available: true
	location: Location
	pick_up_enabled: true
	pick_up_time: string
}

interface SellingPlanOption {
	name: string
	position: number
	value: string
}

interface SellingPlanPriceAdjustment {
	order_count: number | nil
	position: number
	value: number
	value_type: 'percentage' | 'fixed_amount' | 'price'
}

interface SellingPlan {
	checkout_charge: SellingPlanCheckoutCharge
	description: string | nil
	group_id: string
	id: number
	name: string
	options: SellingPlanOption[]
	price_adjustments: SellingPlanPriceAdjustment[]
	recurring_deliveries: boolean
	selected: boolean
}

interface SellingPlanAllocation {
	checkout_charge_amount: number
	compare_at_price: number
	per_delivery_price: number
	price: number
	price_adjustments: {
		position: number
		price: number
	}[]
	remaining_balance_charge_amount: number
	selling_plan: SellingPlan
	selling_plan_group_id: string
	unit_price: number
}

interface SellingPlanGroupOption {
	name: string
	position: number
	selected_value: string | nil
	values: string[]
}

interface SellingPlanGroup {
	app_id: string
	id: string
	name: string
	options: SellingPlanGroupOption[]
	selling_plan_selected: boolean
	selling_plans: SellingPlan[]
}

interface DiscountApplication {
	target_selection: 'all' | 'entitled' | 'explicit'
	target_type: 'line_item' | 'shipping_line'
	title: string
	total_allocated_amount: number
	type: 'automatic' | 'discount_code' | 'manual' | 'script'
	value: number
	value_type: 'fixed_amount' | 'percentage'
}

type OptionsByName = Record<string, string[]>
type OptionsWithValues = { name: string; value: string }[]
type DiscountAllocation = { amount: number; discount_application: DiscountApplication }

interface Media {
	media_type: 'image' | 'model' | 'video' | 'external_video'
	id: number
	alt: string
	position: number
	preview_image: Image
}

interface Rating {
	rating: number
	scale_max: number
	scale_min: number
}

interface ProductOption {
	name: string
	position: number
	selected_value: string
	values: string[]
}

interface Image {
	alt: string
	aspect_ratio: number
	'attached_to_variant?': boolean
	height: number
	id: number
	position: number
	product_id: number | nil
	src: string
	variants: ProductVariant[] | nil
	width: number
	image_presentation:
		| {
				focal_point: {
					x: number
					y: number
				}
		  }
		| nil
}

interface QuantityRule {
	min: number | nil
	max: number | nil
	increment: number
}

interface Product {
	available: boolean
	collections: any[]
	compare_at_price: string
	compare_at_price_max: string
	compare_at_price_min: string
	compare_at_price_varies: boolean
	content: string
	created_at: string
	description: string
	featured_image: Image
	featured_media: Media
	first_available_variant: ProductVariant
	'gift_card?': boolean
	handle: string
	has_only_default_variant: boolean
	id: number
	images: Image[]
	media: Media[]
	metafields: any
	options: string[]
	options_by_name: OptionsByName
	options_with_values: OptionsWithValues
	price: string
	price_max: string
	price_min: string
	price_varies: boolean
	published_at: string
	requires_selling_plan: boolean
	selected_or_first_available_selling_plan_allocation: SellingPlanAllocation
	selected_or_first_available_variant: ProductVariant
	selected_selling_plan: SellingPlan
	selected_selling_plan_allocation: SellingPlanAllocation | nil
	selected_variant: ProductVariant
	selling_plan_groups: SellingPlanGroup[]
	tags: string[]
	template_suffix: string
	title: string
	type: string
	url: string
	variants: ProductVariant[]
	vendor: string
}

type ProductVariantOptionKeys = 'option1' | 'option2' | 'option3'

interface ProductVariant {
	available: boolean
	barcode: string
	compare_at_price: number
	featured_image: Image
	featured_media: Media
	id: number
	image: Image
	incoming: boolean
	inventory_management: string
	inventory_policy: string
	inventory_quantity: number
	matched: boolean
	metafields: any
	next_incoming_date: string
	option1: string | nil
	option2: string | nil
	option3: string | nil
	options: string[]
	price: number
	product: Product | {}
	quantity_rule: QuantityRule | {}
	requires_selling_plan: boolean
	requires_shipping: boolean
	selected: boolean
	selected_selling_plan_allocation: SellingPlanAllocation
	selling_plan_allocations: SellingPlanAllocation[]
	sku: string
	store_availabilities: StoreAvailability[]
	taxable: boolean
	title: string
	unit_price: number | nil
	unit_price_measurement: UnitPriceMeasurement
	url: string
	weight: number
	weight_in_unit: number
	weight_unit: string
	inventory_status: 'PreOrder' | 'InStock' | 'OutOfStock'
	inventory_status_text: string
}

interface LineItem {
	discount_allocations: DiscountAllocation[]
	final_line_price: number
	final_price: number
	fulfillment: any | undefined
	fulfillment_service: string | undefined
	gift_card: boolean
	grams: number
	id: number
	image: Image
	key: string
	line_level_discount_allocations: DiscountAllocation[]
	line_level_total_discount: number
	line_price: string
	message: string
	options_with_values: OptionsWithValues
	original_line_price: number
	original_price: number
	price: number
	product: Product
	product_id: number
	properties: { name: string; value: string }[]
	quantity: number
	requires_shipping: boolean
	selling_plan_allocation: SellingPlanAllocation | nil
	sku: string
	successfully_fulfilled_quantity: number
	tax_lines: TaxLine[]
	taxable: boolean
	title: string
	total_discount: number
	unit_price: number
	unit_price_measurement: UnitPriceMeasurement
	url: string
	url_to_remove: string
	variant: ProductVariant
	variant_id: number
	vendor: string
}

interface Cart {
	attributes: Attributes
	cart_level_discount_applications: DiscountApplication[]
	checkout_charge_amount: number
	currency: Currency
	discount_applications: DiscountApplication[]
	'empty?': boolean
	item_count: number
	items: LineItem[]
	items_subtotal_price: number
	note: string
	original_total_price: number
	requires_shipping: boolean
	taxes_included: boolean
	total_discount: number
	total_price: number
	total_weight: number
}

export {
	FilterValue,
	TaxLine,
	Filter,
	Collection,
	UnitPriceMeasurement,
	SellingPlanCheckoutCharge,
	Currency,
	Measurement,
	Market,
	Country,
	Address,
	Location,
	StoreAvailability,
	SellingPlanOption,
	SellingPlanPriceAdjustment,
	SellingPlan,
	SellingPlanAllocation,
	SellingPlanGroupOption,
	SellingPlanGroup,
	DiscountApplication,
	Media,
	Rating,
	ProductOption,
	Image,
	QuantityRule,
	Product,
	ProductVariant,
	LineItem,
	Cart,
	ProductVariantOptionKeys,
}
