/** @type {import('prettier').Config} */
const config = {
	// Wrap long lines around this point when Prettier can do so cleanly.
	printWidth: 100,

	// Use tabs for indentation. tabWidth controls how wide those tabs are treated.
	useTabs: true,
	tabWidth: 2,

	// End statements with semicolons.
	semi: true,

	// Prefer single quotes in code, but keep JSX attributes in double quotes.
	singleQuote: true,
	jsxSingleQuote: false,

	// Only quote object keys when JavaScript requires it.
	quoteProps: 'as-needed',

	// Add trailing commas wherever modern JavaScript allows them.
	trailingComma: 'all',

	// Put spaces inside object literals: { name: 'Arthur' }.
	bracketSpacing: true,

	// Put a multiline JSX element's closing bracket on its own line.
	bracketSameLine: false,

	// Leave parentheses off a single arrow-function parameter: item => item.name.
	arrowParens: 'avoid',

	// Use Prettier's alternate layout for long, nested ternaries.
	experimentalTernaries: true,

	// Keep an object on one line if it was already written on one line.
	objectWrap: 'preserve',

	// Put each JSX prop on its own line when an element spans multiple lines.
	singleAttributePerLine: true,

	// Do not wrap prose in Markdown files.
	proseWrap: 'never',

	// Let CSS determine whether whitespace inside HTML matters.
	htmlWhitespaceSensitivity: 'css',

	// Format JavaScript, CSS, and other code embedded inside supported files.
	embeddedLanguageFormatting: 'auto',

	// Indent the script and style blocks inside Vue files.
	vueIndentScriptAndStyle: true,

	// Use Unix line endings on every platform.
	endOfLine: 'lf',
};

module.exports = config;
