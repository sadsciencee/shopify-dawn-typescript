import { DeferredMedia } from '@/scripts/theme/deferred-media'
import { TsDOM as q } from '@/scripts/core/TsDOM'

export type ModelViewerUIReference = {
	pause: () => void
	new (modelViewEl: HTMLElement): ModelViewerUIReference
} & typeof HTMLElement

export class ProductModel extends DeferredMedia {
	static override htmlSelector = 'product-model'
	modelViewerUI?: ModelViewerUIReference
	constructor() {
		super()
	}

	override loadContent() {
		super.loadContent()

		if (window.Shopify && window.Shopify.loadFeatures) {
			window.Shopify.loadFeatures([
				{
					name: 'model-viewer-ui',
					version: '1.0',
					onLoad: this.setupModelViewerUI.bind(this),
				},
			])
		}
	}

	setupModelViewerUI(errors: unknown) {
		if (errors) return

		if (!window.Shopify || !window.Shopify.ModelViewerUI)
			throw new Error('window.Shopify.ModelViewerUI is not defined')
		const modelViewerEl = q.rs('model-viewer', this)

		this.modelViewerUI = new window.Shopify.ModelViewerUI(modelViewerEl)
	}
}

export class WindowProductModel {
	loadShopifyXR() {
		const loadFeatures = window?.Shopify?.loadFeatures
		if (!loadFeatures) {
			throw new Error('window.Shopify.loadFeatures is not defined')
		}
		loadFeatures([
			{
				name: 'shopify-xr',
				version: '1.0',
				onLoad: this.setupShopifyXR.bind(this),
			},
		])
	}
	setupShopifyXR(errors?: unknown) {
		if (errors) return

		if (!window.ShopifyXR) {
			document.addEventListener('shopify_xr_initialized', () =>
				this.setupShopifyXR()
			)
			return
		}

		const productJsonScripts = q.ol<HTMLScriptElement>(
			'[id^="ProductJSON-"]'
		)
		if (productJsonScripts) {
			productJsonScripts.forEach((modelJSON) => {
				if (!window.ShopifyXR)
					throw new Error('window.ShopifyXR is not defined')
				const textContent = modelJSON.textContent
				if (!textContent)
					throw new Error('modelJSON.textContent is not defined')
				window.ShopifyXR.addModels(JSON.parse(textContent))
				modelJSON.remove()
			})
		}
		window.ShopifyXR.setupXRElements()
	}
}
// this should run as a post-definition callback on the custom element
export function loadProductModel() {
	window.ProductModel = new WindowProductModel()

	window.addEventListener('DOMContentLoaded', () => {
		if (
			window.ProductModel &&
			window.ProductModel instanceof WindowProductModel
		)
			window.ProductModel.loadShopifyXR()
	})
}
