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
	isGlowEnabled?: boolean;
	style?: StyleProp<ViewStyle>;
}

/**
 * Animation consts
 */
const glowDuration = 200;
const fillDelay = 80;
const fillDuration = 2000;
export const progressBarAnimationDuration = fillDelay + fillDuration;

/**
 * Shows an animated progress bar with an optional glow.
 */
export default function ProgressBar({
	color,
	percent,
	isGlowEnabled = true,
	style,
}: ProgressBarProps) {
	/**
	 * Progress values and animations
	 */
	const targetPercent = Math.max(0, Math.min(percent, 100));
	const previousPercent = useRef(targetPercent);
	const fill = useSharedValue(targetPercent);
	const glow = useSharedValue(0);

	const glowStyle = useAnimatedStyle(() => ({
		opacity: glow.value,
	}));
	const fillStyle = useAnimatedStyle(() => ({
		backgroundColor: color,
		transform: [
			{
				scaleX: fill.value / 100,
			},
		],
	}));

	/**
	 * Fills the bar from the left and adds a glow when enabled.
	 */
	useEffect(() => {
		if (targetPercent === previousPercent.current) {
			return;
		}

		previousPercent.current = targetPercent;

		if (isGlowEnabled) {
			glow.set(
				withSequence(
					withTiming(0.7, {
						duration: glowDuration,
					}),
					withDelay(
						fillDelay + fillDuration - glowDuration,
						withTiming(0, {
							duration: 288,
						}),
					),
				),
			);
		}

		fill.set(
			withDelay(
				fillDelay,
				withTiming(targetPercent, {
					duration: fillDuration,
					easing: Easing.inOut(Easing.cubic),
				}),
			),
		);

		return () => {
			cancelAnimation(fill);
			cancelAnimation(glow);
		};
	}, [targetPercent, fill, glow, isGlowEnabled]);

	/**
	 * Render the bar
	 */
	return (
		<View style={style}>
			{isGlowEnabled && <Animated.View style={[styles.glow, glowStyle]} />}
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
		boxShadow: `0 0 8px 1px ${colors.light.goldenBorder}`,
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
