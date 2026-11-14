import { useEffect, useState } from 'react';
import { Text, type TextProps } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Options for the numbers, text, and how long the count takes.
 */
interface CountUpProps extends Omit<TextProps, 'children'> {
	value: number;
	from?: number;
	delay?: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
}

export const countUpDuration = 1020;

/**
 * Show a number changing from its starting value to its final value.
 */
export default function CountUp({
	value,
	from = 0,
	delay = 0,
	duration = countUpDuration,
	prefix = '',
	suffix = '',
	accessibilityLabel,
	...textProps
}: CountUpProps) {
	const reducedMotion = useReducedMotion();
	const startCount = Math.round(from);
	const finalCount = Math.round(value);
	const [count, setCount] = useState(startCount);
	const shouldCount = !reducedMotion && duration > 0 && finalCount > startCount;

	/**
	 * Show the final number right away if we do not need to count.
	 */
	let displayedCount = finalCount;

	if (shouldCount) {
		displayedCount = count;
	}

	const label = `${prefix}${displayedCount.toLocaleString()}${suffix}`;
	const finalLabel = `${prefix}${finalCount.toLocaleString()}${suffix}`;

	/**
	 * Wait, then add one each time the timer ticks.
	 * Stop when we reach the final number.
	 */
	useEffect(() => {
		if (!shouldCount) {
			return;
		}

		let nextCount = startCount;
		let interval: ReturnType<typeof setInterval> | undefined;
		const tickDuration = duration / (finalCount - startCount);
		const timer = setTimeout(() => {
			interval = setInterval(() => {
				nextCount += 1;
				setCount(nextCount);
				if (nextCount === finalCount) {
					clearInterval(interval);
				}
			}, tickDuration);
		}, delay);

		/**
		 * Stop both timers when this view closes.
		 */
		return () => {
			clearTimeout(timer);

			if (interval !== undefined) {
				clearInterval(interval);
			}
		};
	}, [startCount, finalCount, delay, duration, shouldCount]);

	/**
	 * Screen readers say the final number once instead of reading each change.
	 */
	return (
		<Text
			{...textProps}
			accessibilityLabel={accessibilityLabel ?? finalLabel}
		>
			{label}
		</Text>
	);
}
