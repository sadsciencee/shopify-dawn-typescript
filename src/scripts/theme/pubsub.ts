// todo: add additional data types as needed
export type CartUpdateEvent = {
	source: 'cart-items' | 'product-form'
	productVariantId?: string
}

export type CartErrorEvent = {
	source: 'product-form',
	productVariantId: string,
	errors: string,
	message: string,
}

export type PubSubEvent = CartUpdateEvent | CartErrorEvent | undefined

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
