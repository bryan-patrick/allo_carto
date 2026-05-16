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

export const colors = {
	dark: {
		primary: '#1C5B5E',
		secondary: '#762D3D',
		text: '#121212',
		background: '#131A1B',
		border: '#1B2B31',
		secondaryBorder: '#382326',
	},
	light: {
		primary: '#7BADA6',
		secondary: '#E09FAD',
		text: '#F7F7F7',
		background: '#ACC3BB',
		border: '#465B5D',
		secondaryBorder: '#6B474B',
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
