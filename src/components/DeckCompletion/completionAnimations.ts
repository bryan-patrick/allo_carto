import { Easing, FadeInLeft, ReduceMotion } from 'react-native-reanimated';

export const completionEntryDuration = 384;
export const completionStagger = 180;

/**
 * Stagger with index
 */
export function getCompletionDelay(index: number) {
	return index * completionStagger;
}

/**
 * A short slide shared by the header, passage, result rows, and receipt
 */
export function getCompletionEntry(index: number) {
	return FadeInLeft.duration(completionEntryDuration)
		.delay(getCompletionDelay(index))
		.easing(Easing.out(Easing.cubic))
		.withInitialValues({ opacity: 0, transform: [{ translateX: -12 }] })
		.reduceMotion(ReduceMotion.System);
}
