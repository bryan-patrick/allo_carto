import { SharedValue } from 'react-native-reanimated';
import filterFillerWords from './filterFillerWords';

export interface GetFillerWordsProps {
	language?: 'french' | 'english';
	amount?: number;
	cefrLevel?: string;
	correctWords: string[];
	words?: string[];
}

/**
 * TODO: Remove mockwords
 */
const mockWords = [
	'hello',
	'thank you',
	'yes',
	'no',
	'water',
	'bread',
	'house',
	'work',
	'friend',
	'eat',
];

export function sleep(ms: number | SharedValue<number>) {
	return new Promise(_ => setTimeout(_, ms as number));
}

/**
 * TODO refactor mock once DB is up
 *
 * This function gets filler words for the
 * user to select from when doing flash cards
 */
export default async function getFillerWords({
	amount = 8,
	correctWords,
	words = mockWords,
}: GetFillerWordsProps) {
	return filterFillerWords({ amount, correctWords, words });
}
