import shopify from 'vite-plugin-shopify'
import { resolve } from 'node:path'
import cssnano from 'cssnano'
import advancedPreset from 'cssnano-preset-advanced'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
	css: {
		transformer: 'postcss',
		postcss: {
			plugins: [
				cssnano(
					advancedPreset({
						autoprefix: false,
						mergeRules: true,
						discardDuplicates: true,
						reduceIdents: false,
						zindex: false,
					})
				),
			],
		}
	},
	server: {
		secure: false,
		host: 'localhost',
		https: true,
		port: 3000,
	} ,
	publicDir: 'public',
	resolve: {
		alias: {
			'@js': resolve('src/scripts'),
			'@scss': resolve('src/styles'),
		},
	},
	plugins: [
		basicSsl(),
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
		cssMinify: 'postcss',
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
}
