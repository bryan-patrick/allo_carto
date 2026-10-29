import type { CardDeck, Word } from '../../components/CardDeck/cardDeckTypes';
import { createFlashcardDecks } from '../../util/createFlashcardDecks';
import { getDB } from '../connection';
import type { WordRow } from '../types';
import getDeckWordChoices from './getDeckWordChoices';

/**
 * These are the paragraph, target card count, and learner we need to load flashcards.
 */
interface GetDeckProps {
	deck: CardDeck;
	/**
	 * We use this as the target deck size. A deck can grow to 1.5 times this amount
	 * so we can spread the paragraph's cards evenly across decks.
	 */
	amount: number;
	userId: string;
}

interface DeckWordRow extends WordRow {
	userSeenCount: number;
}

/**
 * We use this to turn a saved word into a flashcard the app can display.
 */
function parseWordRow(row: DeckWordRow): Word {
	const { englishWords, isVulgar, userCorrectCount, userSeenCount, ...wordFields } = row;

	return {
		...wordFields,
		englishWords: JSON.parse(englishWords),
		isVulgar: Boolean(isVulgar),
		correctCount: userCorrectCount ?? 0,
		seenCount: userSeenCount ?? 0,
	};
}

/**
 * We use this to prepare a paragraph when the learner selects Flashcards.
 * We load its words and the learner's saved word progress, then shuffle and split the
 * words into decks. We return the first deck to play, plus the full plan of word IDs
 * so we know which words belong to the other decks.
 */
export default async function getDeck({
	deck,
	amount,
	userId,
}: GetDeckProps): Promise<CardDeck | undefined> {
	const placeholders = deck.wordIds.map(() => '?').join(',');

	/**
	 * Load all the paragraph's learnable words so every word can go into a deck.
	 * Include this learner's word counts so each flashcard has their saved progress.
	 */
	try {
		const database = await getDB();
		const rows = await database.getAllAsync<DeckWordRow>(
			`
			SELECT
				w.*,
				COALESCE(uw.correctCount, 0) AS userCorrectCount,
				COALESCE(uw.seenCount, 0) AS userSeenCount
			FROM words AS w
			LEFT JOIN userWords AS uw
				ON uw.wordId = w.id
				AND uw.userId = ?
			WHERE w.id IN (${placeholders});
			`,
			userId,
			...deck.wordIds,
		);

		const words = rows?.map(parseWordRow) ?? [];
		const wordsById = new Map(words.map(word => [word.id, word]));
		const wordIds = words.map(word => word.id);
		const flashcardDecks = createFlashcardDecks(wordIds, amount);

		/**
		 * The plan holds word IDs. Look up the first deck's full word details in the
		 * same order so the learner sees the cards in the order we just shuffled.
		 */
		const firstDeckWordIds = flashcardDecks[0] ?? [];
		const firstDeckWords = firstDeckWordIds.map(wordId => wordsById.get(wordId));
		const selectedWords = firstDeckWords.filter((word): word is Word => word !== undefined);
		const wordChoices = await getDeckWordChoices({
			wordIds: deck.wordIds,
		});

		/**
		 * Use the first deck's words for the flashcards on screen. Keep the whole
		 * paragraph's word IDs and answer choices for the passage and choice buttons.
		 */
		return {
			...deck,
			words: selectedWords,
			wordChoices,
			flashcardDecks,
		};
	} catch (error) {
		console.error('Could not retrieve deck:', error);
	}
}
