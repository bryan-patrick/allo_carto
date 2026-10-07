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
const glowDuration = 140;
const fillDelay = 460;
const fillDuration = 650;

/**
 * Progress bar with glow/fill animation
 */
export default function ProgressBar({ color, percent, style }: ProgressBarProps) {
	const previousPercent = useRef(percent);
	const fill = useSharedValue(percent);
	const glow = useSharedValue(0);
	const previewOpacity = useSharedValue(0);

	const glowStyle = useAnimatedStyle(() => ({
		opacity: glow.value,
	}));
	const fillStyle = useAnimatedStyle(() => ({
		backgroundColor: color,
		width: `${fill.value}%`,
	}));
	const previewStyle = useAnimatedStyle(() => ({
		left: `${fill.value}%`,
		width: `${Math.max(0, percent - fill.value)}%`,
		opacity: previewOpacity.value,
	}));

	/**
	 * Do the animation
	 */
	useEffect(() => {
		if (percent === previousPercent.current) return;

		previousPercent.current = percent;

		previewOpacity.set(0);

		glow.set(
			withSequence(
				withTiming(0.7, { duration: glowDuration }),
				withDelay(fillDelay + fillDuration - glowDuration, withTiming(0, { duration: 240 })),
			),
		);

		previewOpacity.set(withDelay(glowDuration, withTiming(1, { duration: 140 })));

		fill.set(
			withDelay(
				fillDelay,
				withTiming(percent, { duration: fillDuration, easing: Easing.inOut(Easing.cubic) }),
			),
		);

		return () => {
			cancelAnimation(fill);
			cancelAnimation(glow);
			cancelAnimation(previewOpacity);
		};
	}, [percent, fill, glow, previewOpacity]);

	/**
	 * Render the bar
	 */
	return (
		<View style={style}>
			<Animated.View style={[styles.glow, glowStyle]} />
			<View style={styles.clip}>
				<Animated.View style={[styles.segment, styles.preview, previewStyle]} />
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
	preview: {
		backgroundColor: colors.dark.border,
	},
	segment: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
	},
});
