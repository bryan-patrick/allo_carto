// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
	expoConfig,
	{
		ignores: ['dist/*'],
		rules: {
			// Show a warning when an effect changes state right away.
			'react-hooks/set-state-in-effect': 'warn',

			// Show a warning when code makes a component during render.
			'react-hooks/static-components': 'warn',
		},
	},
]);
