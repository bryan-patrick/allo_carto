import { DarkTheme, Theme } from '@react-navigation/native';
import colors from './colors';

/**
 * This file is meant to be used sparingly.
 *
 * Our theme values are expected native theme values.
 *
 * For application specific theming, look in `styles.ts`
 */
const alloTheme: Theme = {
	dark: true,
	colors: {
		...DarkTheme.colors,
		background: colors.dark.background,
		text: colors.light.text,
	},
	fonts: {
		regular: {
			fontFamily: 'lexend-400',
			fontWeight: '400',
		},
		medium: {
			fontFamily: 'lexend-400',
			fontWeight: '400',
		},
		bold: {
			fontFamily: 'lexend-600',
			fontWeight: '600',
		},
		heavy: {
			fontFamily: 'lexend-600',
			fontWeight: '600',
		},
	},
};

export default alloTheme;
