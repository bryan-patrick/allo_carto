import type { CardDeck, Word } from '../../components/CardDeck/cardDeckTypes';
import type { LoadedFlashcardDeck } from '../../components/CardDeck/deckSessionTypes';
import { getDB } from '../connection';
import type { WordRow } from '../types';
import { getFlashcardCycle } from './flashcardCycles';
import getDeckWordChoices from './getDeckWordChoices';

/**
 * These are the paragraph, target card count, and learner we need to load flashcards.
 */
interface GetDeckProps {
	deck: CardDeck;
	/**
	 * The target deck size. A deck can grow to 1.5 times this amount
	 * so we can spread the paragraph's cards evenly across decks.
	 */
	amount: number;
	userId: string;
}

interface DeckWordRow extends WordRow {
	userSeenCount: number;
}

/**
 * Turn a saved database word into flashcard data the app can display.
 * Read its English answers as a list, turn the vulgar-word setting into true or false,
 * and include the learner's word counts, starting at zero when no counts are saved.
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
 * Prepare a paragraph when the learner selects Flashcards.
 * Load the words, shuffle, then return the current deck and its answers.
 * The learner continues at the next unanswered card
 */
export default async function getDeck({
	deck,
	amount,
	userId,
}: GetDeckProps): Promise<LoadedFlashcardDeck | undefined> {
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
		const unseenWords = words.filter(word => (word.seenCount ?? 0) === 0);
		const unseenWordIds = unseenWords.map(word => word.id);

		if (wordIds.length === 0) {
			return;
		}

		const cycle = await getFlashcardCycle({
			database,
			userId,
			deckId: deck.id,
			wordIds,
			unseenWordIds,
			targetCardsPerDeck: amount,
		});

		/**
		 * Look up the current deck's words in order
		 */
		const currentDeckWordIds = cycle.decks[cycle.deckIndex] ?? [];
		const currentDeckWords = currentDeckWordIds.map(wordId => wordsById.get(wordId));
		const selectedWords = currentDeckWords.filter((word): word is Word => word !== undefined);

		const firstUnansweredIndex = selectedWords.findIndex(word => {
			return !cycle.session.results.some(result => result.wordId === word.id);
		});

		let currentIndex = firstUnansweredIndex;

		/**
		 * Its saved answer lets us finish the deck and show results without playing it again.
		 */
		if (currentIndex === -1) {
			currentIndex = Math.max(0, selectedWords.length - 1);
		}

		const wordChoices = await getDeckWordChoices({
			wordIds: deck.wordIds,
		});

		/**
		 * Use the current deck's words for the flashcards on screen.
		 *
		 * BUT we keep the whole paragraph's word IDs and
		 * answer choices for the passage and choice buttons.
		 */
		return {
			cardDeck: {
				...deck,
				words: selectedWords,
				wordChoices,
				flashcardDecks: cycle.decks,
			},
			session: cycle.session,
			currentIndex,
		};
	} catch (error) {
		console.error('Could not retrieve deck:', error);
	}
}
