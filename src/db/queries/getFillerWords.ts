import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import filterFillerWords from '@/src/util/filterFillerWords';
import { getDB } from '../connection';

/**
 * Typing
 */
interface GetDeckFillerWordsProps {
	amount?: number;
	correctWords: string[];
	deck: CardDeck;
}

interface FillerWordRow {
	englishWords: string;
}

/**
 * Get random english words as "filler" words for when we
 * map the choice buttons the user can press to make their selection.
 */
export default async function getDeckFillerWords({
	amount = 8,
	correctWords,
	deck,
}: GetDeckFillerWordsProps) {
	if (deck.wordIds.length === 0) {
		return filterFillerWords({ amount, correctWords, words: [] });
	}

	const database = await getDB();
	const placeholders = deck.wordIds.map(() => '?').join(',');
	const rows = await database.getAllAsync<FillerWordRow>(
		`
		SELECT englishWords
		FROM words
		WHERE id IN (${placeholders})
		ORDER BY RANDOM();
		`,
		deck.wordIds,
	);

	const words: string[] = [];

	for (const row of rows) {
		const englishWords = JSON.parse(row.englishWords) as string[];

		for (const englishWord of englishWords) {
			words.push(englishWord);
		}
	}

	return filterFillerWords({
		amount,
		correctWords,
		words,
	});
}
