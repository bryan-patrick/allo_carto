import colors from '@/src/app/colors';
import { StyleSheet } from 'react-native';

/**
 * Shared collection page styles
 */
export const collectionsPageStyles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		padding: 16,
		gap: 24,
	},
	introduction: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 20,
		textAlign: 'center',
		color: colors.dark.text,
	},
});
