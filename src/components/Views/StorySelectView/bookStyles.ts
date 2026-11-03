import colors from '@/src/app/colors';
import { StyleSheet } from 'react-native';

const bookCornerRadius = 8;
const spineCornerRadius = 2;

// Keep the book's outer shape, cover border, and shadow together.
export const bookStyles = StyleSheet.create({
	book: {
		backgroundColor: colors.light.background,
		borderTopLeftRadius: spineCornerRadius,
		borderBottomLeftRadius: spineCornerRadius,
		borderTopRightRadius: bookCornerRadius,
		borderBottomRightRadius: bookCornerRadius,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.6,
		shadowRadius: 1,
		flexDirection: 'row',
		marginHorizontal: 16,
		marginBottom: 4, // for the box shadow
	},
	spineCorners: {
		borderTopLeftRadius: spineCornerRadius,
		borderBottomLeftRadius: spineCornerRadius,
	},
	coverCorners: {
		borderTopRightRadius: bookCornerRadius,
		borderBottomRightRadius: bookCornerRadius,
	},
	coverBorder: {
		...StyleSheet.absoluteFill,
		borderTopWidth: 1,
		borderRightWidth: 1,
		borderBottomWidth: 1,
		borderTopRightRadius: bookCornerRadius,
		borderBottomRightRadius: bookCornerRadius,
		borderColor: colors.light.border,
	},
});
