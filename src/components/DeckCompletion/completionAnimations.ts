import { Easing, FadeInLeft, ReduceMotion } from 'react-native-reanimated';

export const completionEntryDuration = 360;
export const completionStagger = 180;

/*
 * Delay each result row based on its position so the rows appear one after another.
 */
export function getCompletionDelay(index: number) {
	return index * completionStagger;
}

/*
 * Slide and fade in word details or unlock choices, one row at a time.
 * Follow the device's reduced-motion setting.
 */
export function getCompletionEntry(index: number) {
	return FadeInLeft.duration(completionEntryDuration)
		.delay(getCompletionDelay(index))
		.easing(Easing.out(Easing.cubic))
		.withInitialValues({ opacity: 0, transform: [{ translateX: -12 }] })
		.reduceMotion(ReduceMotion.System);
}
