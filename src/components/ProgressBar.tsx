import colors from '@/src/app/colors';
import { useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from 'react-native-reanimated';

/**
 * Typing
 */
interface ProgressBarProps {
	color: string;
	percent: number;
	style?: StyleProp<ViewStyle>;
}

/**
 * Animation consts
 */
const glowDuration = 200;
const fillDelay = 120;
const fillDuration = 3800;
export const progressBarAnimationDuration = fillDelay + fillDuration;

/**
 * Progress bar with glow/fill animation
 */
export default function ProgressBar({ color, percent, style }: ProgressBarProps) {
	const targetPercent = Math.max(0, Math.min(percent, 100));
	const previousPercent = useRef(targetPercent);
	const fill = useSharedValue(targetPercent);
	const glow = useSharedValue(0);

	const glowStyle = useAnimatedStyle(() => ({
		opacity: glow.value,
	}));
	const fillStyle = useAnimatedStyle(() => ({
		backgroundColor: color,
		transform: [{ scaleX: fill.value / 100 }],
	}));

	/**
	 * Animate the visible fill on the UI thread. Scaling from the left avoids
	 * percentage-width layout updates while keeping one continuous fill.
	 */
	useEffect(() => {
		if (targetPercent === previousPercent.current) return;

		previousPercent.current = targetPercent;

		glow.set(
			withSequence(
				withTiming(0.7, { duration: glowDuration }),
				withDelay(fillDelay + fillDuration - glowDuration, withTiming(0, { duration: 288 })),
			),
		);

		fill.set(
			withDelay(
				fillDelay,
				withTiming(targetPercent, { duration: fillDuration, easing: Easing.inOut(Easing.cubic) }),
			),
		);

		return () => {
			cancelAnimation(fill);
			cancelAnimation(glow);
		};
	}, [targetPercent, fill, glow]);

	/**
	 * Render the bar
	 */
	return (
		<View style={style}>
			<Animated.View style={[styles.glow, glowStyle]} />
			<View style={styles.clip}>
				<Animated.View style={[styles.segment, fillStyle]} />
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	glow: {
		...StyleSheet.absoluteFill,
		borderRadius: 4,
		boxShadow: `0 0 8px 1px ${colors.light.text}`,
	},
	clip: {
		flex: 1,
		borderRadius: 4,
		overflow: 'hidden',
	},
	segment: {
		width: '100%',
		transformOrigin: 'left center',
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
	},
});
