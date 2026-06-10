import { SharedValue } from 'react-native-reanimated';
import filterFillerWords from './filterFillerWords';

/**
 * Typing
 */
export interface GetFillerWordsProps {
	language?: 'french' | 'english';
	amount?: number;
	cefrLevel?: string;
	correctWords: string[];
	words?: string[];
}

/**
 * ZZZZZZZZZZzzzzzzzzzzz
 */
export function sleep(ms: number | SharedValue<number>) {
	return new Promise(_ => setTimeout(_, ms as number));
}

/**
 * This function gets filler words for the
 * user to select from when doing flash cards.
 *
 * We can flatmap this since they're all words anyway.
 */
export default async function getFillerWords({
	amount = 8,
	correctWords,
	words,
}: GetFillerWordsProps) {
	return filterFillerWords({
		amount,
		correctWords,
		words,
	});
}
