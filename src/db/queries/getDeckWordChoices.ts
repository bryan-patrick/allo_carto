import { type DeckWordChoice } from '../../components/CardDeck/cardDeckTypes';
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
	partOfSpeech?: string;
}

/**
 * Gets the correct english words from a deck.
 * This is set on the current deck and used
 * for the mapped choice buttons the user selects.
 */
export default async function getDeckWordChoices({
	wordIds,
}: GetDeckEnglishWordsProps): Promise<DeckWordChoice[]> {
	const database = await getDB();
	const quests = wordIds.map(() => '?').join(',');

	const rows = await database.getAllAsync<DeckEnglishWordsRow>(
		`
		SELECT englishWords, partOfSpeech
    FROM words
    WHERE id IN (${quests})
    ORDER BY RANDOM();
    `,
		wordIds,
	);

	return rows.map(row => ({
		englishWords: JSON.parse(row.englishWords),
		partOfSpeech: row.partOfSpeech ?? undefined,
	}));
}
