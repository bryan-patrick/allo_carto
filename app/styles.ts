import { StyleSheet } from 'react-native';

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
		background: '#DBFBF0',
		border: '#465B5D',
		secondaryBorder: '#6B474B',
	},
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.dark.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	linkButtonStyles: {
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.dark.border,
		backgroundColor: colors.dark.primary,
		borderRadius: 8,
		borderWidth: 2,
		padding: 24,
		margin: 24,
		gap: 16,
		boxShadow: `8px 8px 0 0 ${colors.dark.border}`,
	},
	hoveredLinkButtonStyles: {
		borderRadius: 4,
		borderWidth: 2,
	},
	pressedLinkButtonStyles: {
		borderColor: colors.light.border,
		backgroundColor: colors.light.primary,
		color: '#ff0000',
	},
	linkTextStyles: {
		color: colors.light.text,
		fontWeight: '800',
		fontSize: 18,
	},
	hoveredLinkTextStyles: {
		color: colors.light.text,
	},
	pressedLinkTextStyles: {
		color: colors.dark.text,
	},
});

export default styles;
