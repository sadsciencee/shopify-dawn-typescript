import { nil } from '@/scripts/types/api'

export as namespace shopify;

type nil = null

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

type CartErrorResponse = {
	status: number
	errors?: string | string[] | { [key: string]: string[] }
	description: string
	message: string
}

type FilterValue = {
	active: boolean
	count: number | nil
	label: string | nil
	param_name: string
	url_to_add: string
	url_to_remove: string
	value: string
}

type TaxLine = {
	price: number
	rate: number
	rate_percentage: number
	title: string
}

type Filter = {
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

type Collection = {
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

type UnitPriceMeasurement = {
	measured_type: 'volume' | 'weight' | 'dimension'
	quantity_value: number
	quantity_unit: string
	reference_value: number
	reference_unit: 'kg'
}

type SellingPlanCheckoutCharge = {
	value: number
	value_type: 'percentage' | 'price'
}

type Currency = {
	iso_code: string
	name: string
	symbol: string
}

type Measurement = {
	type: 'dimension' | 'volume' | 'weight'
	volume: string
	value: number
}

type Market = {
	handle: string
	id: string
	metafields: any
}

type Country = {
	currency: Currency
	iso_code: string
	market: Market
	name: string
	unit_system: 'metric' | 'imperial'
}

type Address = {
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

type Location = {
	address: {}
	id: number
	latitude: number
	longitude: number
	metafields: any
	name: string
}

type StoreAvailability = {
	available: true
	location: Location
	pick_up_enabled: true
	pick_up_time: string
}

type SellingPlanGroupOption = {
	name: string
	position: number
	selected_value: string | nil
	values: string[]
}

type SellingPlanGroup = {
	app_id: string
	id: string
	name: string
	options: SellingPlanGroupOption[]
	selling_plan_selected: boolean
	selling_plans: SellingPlan[]
}

type OptionsByName = Record<string, string[]>
type OptionsWithValues = { name: string; value: string }[]

type Media = {
	media_type: 'image' | 'model' | 'video' | 'external_video'
	id: number
	alt: string
	position: number
	preview_image: Image
}

type Rating = {
	rating: number
	scale_max: number
	scale_min: number
}

type ProductOption = {
	name: string
	position: number
	selected_value: string
	values: string[]
}

type Image = {
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

type Product = {
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

type ProductVariant = {
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

type ShopifyConsentAPIDetail = {
	marketingAllowed: boolean
	saleOfDataAllowed: boolean
	analyticsAllowed: boolean
	preferencesAllowed: boolean
}
