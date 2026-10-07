import CountUp from '@/src/components/CountUp';
import type { TextProps } from 'react-native';
import Animated from 'react-native-reanimated';
import {
	completionEntryDuration,
	getCompletionDelay,
	getCompletionEntry,
} from './completionAnimations';

/**
 * Typing
 */
interface CompletionXPAmountProps extends Omit<TextProps, 'children'> {
	index: number;
	value: number;
}

/**
 * Show the XP amount start counting after it appears
 */
export default function CompletionXPAmount({
	index,
	value,
	...textProps
}: CompletionXPAmountProps) {
	const entering = getCompletionEntry(index);
	const delay = getCompletionDelay(index) + completionEntryDuration;

	return (
		<Animated.View entering={entering}>
			<CountUp
				{...textProps}
				value={value}
				delay={delay}
				prefix="+"
				suffix=" XP"
			/>
		</Animated.View>
	);
}
