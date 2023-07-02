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
	},
})
