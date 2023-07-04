// todo: data type should be known
export type CartUpdateEvent = {
	source: 'cart-items'
}

export type PubSubEvent = CartUpdateEvent | {} | undefined

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
