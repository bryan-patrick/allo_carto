import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import { Animated, type TextProps } from 'react-native';

interface SolveAlertProps extends TextProps {
	isWiggleEnabled?: boolean;
}

/**
 * Shows a puzzle alert with a gentle wiggle that keeps its text at the same size.
 */
export default function SolveAlert({
	isWiggleEnabled = true,
	style,
	children,
	...textProps
}: SolveAlertProps) {
	/**
	 * Keep the text from growing outward from the center of its full-width box.
	 */
	const animatedStyle = useButtonWiggle(isWiggleEnabled, 0.5, 1);

	return (
		<Animated.Text
			{...textProps}
			style={[style, animatedStyle]}
		>
			{children}
		</Animated.Text>
	);
}
