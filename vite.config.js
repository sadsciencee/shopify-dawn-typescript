import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import { resolve } from 'node:path'

export default defineConfig({
	server: {
		host: true,
		https: false,
		port: 3000,
	},
	publicDir: 'public',
	resolve: {
		alias: {
			'@js': resolve('src/scripts'),
			'@scss': resolve('src/styles'),
		},
	},
	plugins: [
		shopify({
			themeRoot: './',
			sourceCodeDir: 'src',
			entrypointsDir: 'src/entry',
			additionalEntrypoints: [],
			snippetFile: 'ucoast.liquid',
		}),
	],
	build: {
		sourcemap: true,
		minify: 'esbuild',
		cssMinify: false,
		rollupOptions: {
			output: {
				output: {
					manualChunks: {
						'core-chunk': (id) => id.includes('/src/core/'),
						'theme-chunk': (id) => id.includes('/src/theme/'),
						'catalog-chunk': (id) => id.includes('/src/catalog/'),
						'product-chunk': (id) => id.includes('/src/product/'),
						'cart-chunk': (id) => id.includes('/src/cart/'),
						'customer-chunk': (id) => id.includes('/src/customer/'),
					},
				}
			}
		}
	},
})
