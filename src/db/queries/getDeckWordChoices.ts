import { getDB } from '../connection';

/**
 * Typing
 *
 * wordIds string[] should be the same wordIds type from CardDeck
 */
interface GetDeckEnglishWordsProps {
	wordIds: string[];
}

/**
 * JSON response from sqlite for each word.englishWords array.
 * It's tricky that its a string instead of an array but
 * remember it's a JSON response.
 */
interface DeckEnglishWordsRow {
	englishWords: string;
}

/**
 * Gets the correct english words from a deck.
 * This is set on the current deck and used
 * for the mapped choice buttons the user selects.
 */
export default async function getDeckWordChoices({
	wordIds,
}: GetDeckEnglishWordsProps): Promise<string[]> {
	let resultWords: string[] = [];
	const database = await getDB();
	const quests = wordIds.map(() => '?').join(',');

	const rows = await database.getAllAsync<DeckEnglishWordsRow>(
		`
    SELECT englishWords
    FROM words
    WHERE id IN (${quests})
    ORDER BY RANDOM();
    `,
		wordIds,
	);

	/**
	 * Since we can have multiple correct answers,
	 * we use arrays. This means we will have an
	 * array of arrays of correct answers, but we
	 * only want a single array of choices, so
	 * that's why we use flatMap, to flatten the
	 * nested arrays into one choices array.
	 */
	resultWords = rows.flatMap(row => JSON.parse(row.englishWords));

	return resultWords;
}
