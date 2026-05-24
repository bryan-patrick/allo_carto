import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface Classes {
	container: ViewStyle;
	h2: TextStyle;
	rowBetween: ViewStyle;
	colBetween: ViewStyle;
	cardView: ViewStyle;
	cardText: TextStyle;
	linkButton: ViewStyle;
	hoveredLinkButton: ViewStyle;
	linkText: TextStyle;
	hoveredLinkText: TextStyle;
	pressedLinkText: TextStyle;
}

/**
 * Aiming for WCAG AAA Dark | Light & Text
 */
export const colors = {
	dark: {
		primary: '#1C5B5E',
		primaryActive: '#6C8384',
		secondary: '#762D3D',
		text: '#121212',
		background: '#131A1B',
		border: '#1B2B31',
		secondaryBorder: '#382326',
		success: '#054C3E',
		warning: '#332105',
		danger: '#3E0E14',
	},
	light: {
		primary: '#7BADA6',
		secondary: '#E09FAD',
		text: '#F7F7F7',
		background: '#ACC3BB',
		border: '#465B5D',
		secondaryBorder: '#6B474B',
		success: '#DDFFD6',
		warning: '#FFC670',
		danger: '#FF7081',
	},
	rank: {
		fnew: '#b7b7b7',
		bronze: '#f4d2b1d4',
		silver: '#e1e7ef',
		gold: '#ffd196',
		diamond: '#c6e9ff',
		memorized: '#00ffcf',
	},
};

const styles = StyleSheet.create<Classes>({
	container: {
		margin: 24,
		gap: 24,
	},
	h2: {
		fontSize: 20,
		fontWeight: 700,
		color: colors.light.text,
	},
	rowBetween: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
	},
	colBetween: {
		gap: 12,
	},
	cardView: {
		backgroundColor: colors.light.background,
		padding: 16,
		borderRadius: 8,
		gap: 16,
	},
	cardText: {
		color: colors.dark.text,
		fontWeight: 500,
		fontSize: 16,
	},
	linkButton: {
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.dark.border,
		backgroundColor: colors.dark.primary,
		borderRadius: 8,
		borderWidth: 2,
		padding: 14,
		gap: 16,
		shadowColor: colors.dark.border,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 1,
		shadowRadius: 0,
	},
	hoveredLinkButton: {
		borderRadius: 4,
		borderWidth: 2,
	},
	linkText: {
		color: colors.light.text,
		fontWeight: '800',
		fontSize: 16,
	},
	hoveredLinkText: {
		color: colors.light.text,
	},
	pressedLinkText: {
		color: colors.light.primary,
	},
});

export default styles;
