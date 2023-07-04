// todo: add additional data types as needed
import { ProductVariant } from '@/scripts/types/api'

export type CartUpdateEvent = {
	source: 'cart-items' | 'product-form'
	productVariantId?: string
}

export type CartErrorEvent = {
	source: 'product-form'
	productVariantId: string
	errors: string | string[] | { [key: string]: string[] }
	message: string
}

export type VariantChangeEvent = {
	source: 'product-form'
	data: {
		sectionId: string
		html: Document
		variant: ProductVariant
	}
}

export type PubSubEvent = CartUpdateEvent | CartErrorEvent | VariantChangeEvent | undefined

// typeguards for events

export function isCartUpdateEvent(obj: PubSubEvent): obj is CartUpdateEvent {
	if (!obj) return false
	if (!('source' in obj)) return false
	if (!('productVariantId' in obj)) return false
	return true
}

export function isCartErrorEvent(obj: PubSubEvent): obj is CartErrorEvent {
	if (!obj) return false
	if (!('source' in obj)) return false
	if (!('productVariantId' in obj)) return false
	if (!('message' in obj)) return false
	if (!('errors' in obj)) return false
	return true
}

export function isVariantChangeEvent(obj: PubSubEvent): obj is VariantChangeEvent {
	if (!obj) return false
	if (!('data' in obj)) return false
	if (!('sectionId' in obj.data)) return false
	if (!('html' in obj.data)) return false
	if (!('variant' in obj.data)) return false
	return true
}

export type SubscriberCallback = (pubSubEvent: PubSubEvent) => void

let subscribers: Record<string, SubscriberCallback[]> = {}

export function subscribe(eventName: string, callback: SubscriberCallback) {
	if (subscribers[eventName] === undefined) {
		subscribers[eventName] = []
	}

	subscribers[eventName] = [...subscribers[eventName], callback]

	return function unsubscribe() {
		subscribers[eventName] = subscribers[eventName].filter((cb) => {
			return cb !== callback
		})
	}
}

export function publish(eventName: string, pubSubEvent: PubSubEvent = undefined) {
	if (subscribers[eventName]) {
		subscribers[eventName].forEach((callback) => {
			callback(pubSubEvent)
		})
	}
}
