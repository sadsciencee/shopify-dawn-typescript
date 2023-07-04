export type ShopifySectionRenderingSchema = { id?: string; section?: string; selector?: string }
export type DebounceCallback = (...args: unknown[]) => unknown
export type FocusableHTMLElement =
	| HTMLAnchorElement
	| HTMLButtonElement
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement
	| HTMLIFrameElement
	| HTMLObjectElement
	| HTMLAreaElement
export type EventWithRelatedTarget = MouseEvent | FocusEvent | DragEvent | PointerEvent

export interface VariantChangeEvent extends Event {
	data: {
		sectionId: string
		html: Document
		currentVariant: JSON
	}
}
