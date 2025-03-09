import {Image, Product} from "@/scripts/types/api";

export interface JsonApiResponse {
    intent: string
    products: JsonProduct[] | Product[]
}

export interface JsonProduct {
    id: number
    title: string
    handle: string
    description: string | null
    published_at: string
    created_at: string
    vendor: string
    type: string
    tags: string[]
    price: number
    price_min: number
    price_max: number
    available: boolean
    price_varies: boolean
    compare_at_price: number | null
    compare_at_price_min: number
    compare_at_price_max: number
    compare_at_price_varies: boolean
    variants: JsonProductVariant[]
    images: string[] | null
    featured_image: string | null
    options: JsonOption[]
    url: string
}

interface JsonProductVariant {
    id: number
    title: string
    option1: string
    option2: string | null
    option3: string | null
    sku: string | null
    requires_shipping: boolean
    taxable: boolean
    featured_image: string | null
    available: boolean
    name: string
    public_title: string
    options: string[]
    price: number
    weight: number
    compare_at_price: number | null
    inventory_management: string
    barcode: string | null
}

interface JsonOption {
    name: string
    position: number
    values: string[]
}
