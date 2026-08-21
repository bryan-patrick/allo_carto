/**
 * This file contains things that have been removed or
 * refactored that might be useful to reuse
 */
import { type LinearGradientProps } from 'expo-linear-gradient';
import colors from '../app/colors';

/**
 * Polaroid
 */
const polaroidColors: LinearGradientProps['colors'] = [
	'#E6320D',
	'#E6320D',
	'#F17E06',
	'#F17E06',
	'#F8BA26',
	'#F8BA26',
	'#78BA34',
	'#78BA34',
	'#3791CF',
	'#3791CF',
];

const polaroidColorStops: NonNullable<LinearGradientProps['locations']> = [
	0, 0.2, 0.2, 0.4, 0.4, 0.6, 0.6, 0.8, 0.8, 1,
];

const polaroidStyles = {
	polaroidContainerStyle: {
		display: 'flex',
		backgroundColor: colors.light.polaroid,
		borderRadius: 2,
		borderWidth: 1,
		borderColor: colors.light.border,
	},
	polaroid: {
		backgroundColor: colors.light.text,
		borderRadius: 2,
		borderWidth: 1,
		borderColor: colors.light.border,
		padding: 12,
	},
};

/**
 * Inventory
 */
void { polaroid: [polaroidColors, polaroidColorStops, polaroidStyles] };
