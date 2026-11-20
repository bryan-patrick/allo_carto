import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Typing
 */
interface ButtonWiggleLoop {
	currentAnimation: Animated.CompositeAnimation | null;
	isAnimationStopped: boolean;
}

/**
 * Repeats a button's wiggle with a fresh pause of one to four seconds each time.
 */
function playButtonWiggle(animationProgress: Animated.Value, animationLoop: ButtonWiggleLoop) {
	/**
	 * Pause and movement timing
	 */
	const randomPauseMilliseconds = Math.random() * 3000;
	const pauseDuration = 1000 + randomPauseMilliseconds;
	const animation = Animated.timing(animationProgress, {
		toValue: 360,
		duration: 360,
		delay: pauseDuration,
		easing: Easing.linear,
		isInteraction: false,
		useNativeDriver: true,
	});

	if (animationLoop.isAnimationStopped) {
		return;
	}

	animationProgress.setValue(0);
	animationLoop.currentAnimation = animation;

	animation.start(({ finished }) => {
		if (finished && !animationLoop.isAnimationStopped) {
			playButtonWiggle(animationProgress, animationLoop);
		}
	});
}

/**
 * Gives an enabled button a repeating wiggle unless reduced motion is turned on.
 */
export function useButtonWiggle(isEnabled: boolean, rotationDegrees = 5) {
	/**
	 * Motion preference and animation progress
	 */
	const isReducedMotionEnabled = useReducedMotion();
	const [animationProgress] = useState(() => new Animated.Value(0));

	/**
	 * Button movement
	 */
	const animatedStyle = {
		transform: [
			{
				scale: animationProgress.interpolate({
					inputRange: [0, 80, 280, 360],
					outputRange: [1, 1.1, 1.1, 1],
				}),
			},
			{
				rotateZ: animationProgress.interpolate({
					inputRange: [0, 80, 130, 230, 280, 360],
					outputRange: [
						'0deg',
						'0deg',
						`${-rotationDegrees}deg`,
						`${rotationDegrees}deg`,
						'0deg',
						'0deg',
					],
				}),
			},
		],
	};

	/**
	 * Stop the movement and pending pause when the button no longer needs a wiggle.
	 */
	useEffect(() => {
		const animationLoop: ButtonWiggleLoop = {
			currentAnimation: null,
			isAnimationStopped: false,
		};

		animationProgress.setValue(0);

		if (!isEnabled || isReducedMotionEnabled) {
			return;
		}

		playButtonWiggle(animationProgress, animationLoop);

		return () => {
			animationLoop.isAnimationStopped = true;
			animationLoop.currentAnimation?.stop();
			animationProgress.setValue(0);
		};
	}, [animationProgress, isEnabled, isReducedMotionEnabled]);

	return animatedStyle;
}
