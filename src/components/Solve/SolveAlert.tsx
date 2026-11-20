import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import {
	Animated,
	StyleSheet,
	View,
	type StyleProp,
	type TextProps,
	type ViewStyle,
} from 'react-native';

interface SolveAlertProps extends TextProps {
	isWiggleEnabled?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Shows a puzzle alert with the shared wiggle centered on its message.
 */
export default function SolveAlert({
	isWiggleEnabled = true,
	containerStyle,
	style,
	children,
	...textProps
}: SolveAlertProps) {
	/**
	 * Shared alert animation
	 */
	const animatedStyle = useButtonWiggle(isWiggleEnabled);

	return (
		<View style={containerStyle}>
			{/* Keep short messages from wiggling around the center of a full-width box. */}
			<Animated.Text
				{...textProps}
				style={[styles.message, style, animatedStyle]}
			>
				{children}
			</Animated.Text>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	message: {
		alignSelf: 'flex-start',
		maxWidth: '100%',
	},
});
