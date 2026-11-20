import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import { Animated, type TextProps } from 'react-native';

interface SolveAlertProps extends TextProps {
	isWiggleEnabled?: boolean;
}

/**
 * Shows a puzzle alert with a gentle wiggle suited to wide messages.
 */
export default function SolveAlert({
	isWiggleEnabled = true,
	style,
	children,
	...textProps
}: SolveAlertProps) {
	const animatedStyle = useButtonWiggle(isWiggleEnabled, 0.5);

	return (
		<Animated.Text
			{...textProps}
			style={[style, animatedStyle]}
		>
			{children}
		</Animated.Text>
	);
}
