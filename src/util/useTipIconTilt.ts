import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Typing
 */
interface TipIconTiltLoop {
	currentTimeout: ReturnType<typeof setTimeout> | null;
	currentTiltDirection: number;
}

/**
 * Schedules the bulb's next instant tilt after a random pause between 600 and 1200 milliseconds.
 */
function scheduleTipIconTilt(rotationDegrees: Animated.Value, tiltLoop: TipIconTiltLoop) {
	const randomDelayMilliseconds = Math.random() * 1200;
	const delayMilliseconds = 1200 + randomDelayMilliseconds;

	tiltLoop.currentTimeout = setTimeout(() => {
		tiltLoop.currentTiltDirection = -tiltLoop.currentTiltDirection;
		rotationDegrees.setValue(tiltLoop.currentTiltDirection);
		scheduleTipIconTilt(rotationDegrees, tiltLoop);
	}, delayMilliseconds);
}

/**
 * Switches an enabled tip bulb between opposite tilts at random intervals.
 */
export function useTipIconTilt(isEnabled: boolean) {
	/**
	 * Motion preference and icon rotation
	 */
	const isReducedMotionEnabled = useReducedMotion();
	const [rotationDegrees] = useState(() => new Animated.Value(0));
	const animatedStyle = {
		transform: [
			{
				rotateZ: rotationDegrees.interpolate({
					inputRange: [-1, 1],
					outputRange: ['-8deg', '8deg'],
				}),
			},
		],
	};

	/**
	 * Change the angle instantly and return the bulb upright when the movement stops.
	 */
	useEffect(() => {
		const tiltLoop: TipIconTiltLoop = {
			currentTimeout: null,
			currentTiltDirection: -1,
		};

		rotationDegrees.setValue(0);

		if (!isEnabled || isReducedMotionEnabled) {
			return;
		}

		rotationDegrees.setValue(tiltLoop.currentTiltDirection);
		scheduleTipIconTilt(rotationDegrees, tiltLoop);

		return () => {
			if (tiltLoop.currentTimeout !== null) {
				clearTimeout(tiltLoop.currentTimeout);
			}

			rotationDegrees.setValue(0);
		};
	}, [isEnabled, isReducedMotionEnabled, rotationDegrees]);

	return animatedStyle;
}
