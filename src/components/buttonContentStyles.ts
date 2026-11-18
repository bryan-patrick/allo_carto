import { StyleSheet } from 'react-native';

/**
 * Keep button labels and icons the same size across filled, outlined, and text buttons.
 */
export const buttonIconSize = 20;
export const buttonIconGap = 4;

export const buttonContentStyles = StyleSheet.create({
	pressedMiniButton: {
		top: 2,
	},
	miniButton: {
		alignSelf: 'flex-start',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderRadius: 4,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	label: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 20,
		includeFontPadding: false,
	},
	icon: {
		width: buttonIconSize,
		height: buttonIconSize,
		lineHeight: buttonIconSize,
		includeFontPadding: false,
		/**
		 * Align the icon font's visible shape with the button label.
		 */
		transform: [
			{
				translateY: 2,
			},
		],
	},
});
