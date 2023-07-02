import { ProductVariant } from '@/scripts/types/api'

interface VariantChange extends Event {
	data: {
		sectionId: string
		html: Document
		variant: ProductVariant
	}
}

interface CartUpdate extends Event {
	source: string
	productVariantId: number
}

interface QuantityUpdate extends Event {
	undefined
}

interface CartError extends Event {
	source: string
	productVariantId: number
	message: string
	errors: string | Record<string, string>
}

interface SlideChangedEvent extends Event {
	detail: {
		currentPage: number
		currentElement: HTMLElement
	}
}

interface BlockSelectEvent extends Event {}
interface BlockDeselectEvent extends Event {}

export {
	VariantChange,
	CartUpdate,
	QuantityUpdate,
	CartError,
	SlideChangedEvent,
	BlockSelectEvent,
	BlockDeselectEvent,
}
