import { StyleSheet, View } from 'react-native';

/**
 * Typing
 */
interface BackgroundTintProps {
	color?: string;
}

/**
 * Tints the background with the chapter category color.
 * It actually doesn't work great since it's addative, idk if I'll keep it...it is pretty subtle though
 */
export default function BackgroundTint({ color }: BackgroundTintProps) {
	const tintStyle = {
		backgroundColor: color,
	};

	return (
		<View
			pointerEvents="none"
			style={[styles.overlay, tintStyle]}
		/>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFill,
		opacity: 0.1,
	},
});
