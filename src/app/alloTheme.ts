import { DarkTheme, Theme } from '@react-navigation/native';
import colors from './styles';

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
			fontFamily: 'lexend-variable',
			fontWeight: '400',
		},
		medium: {
			fontFamily: 'lexend-variable',
			fontWeight: '500',
		},
		bold: {
			fontFamily: 'lexend-variable',
			fontWeight: '600',
		},
		heavy: {
			fontFamily: 'lexend-variable',
			fontWeight: '700',
		},
	},
};

export default alloTheme;
