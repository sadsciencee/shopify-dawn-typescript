// postcss.config.js
const cssnano = require('cssnano')
const advancedPreset = require('cssnano-preset-advanced')

module.exports = {
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
