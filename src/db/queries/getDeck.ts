import type { CardDeck, Word } from '../../components/CardDeck/cardDeckTypes';
import { getDeckWordProgressSelectionWeight } from '../../util/deckWordProgressSelection';
import wordRaffle from '../../util/wordRaffle';
import { getDB } from '../connection';
import type { WordRow } from '../types';
import getDeckWordChoices from './getDeckWordChoices';

interface GetDeckProps {
	deck: CardDeck;
	amount?: number;
	userId: string;
}

interface DeckWordRow extends WordRow {
	userSeenCount: number;
}

function parseWordRow(row: DeckWordRow): { seenCount: number; word: Word } {
	const { englishWords, isVulgar, userCorrectCount, userSeenCount, ...wordFields } = row;

	/**
	 * We have to add back in englishWords and isVulgar
	 * since we have to parse the array and isVulgar is
	 * stored with a numeric value instead of a boolean.
	 */
	return {
		seenCount: userSeenCount ?? 0,
		word: {
			...wordFields,
			englishWords: JSON.parse(englishWords),
			isVulgar: Boolean(isVulgar),
			correctCount: userCorrectCount ?? 0,
		},
	};
}

function dedupeByLemma(words: Word[]): Word[] {
	const seenLemmaIds = new Set<string>();

	/**
	 * Let's build decks with only one card per lemma (infinitives, etc.)
	 * e.g. we don't want both manger and mange
	 */
	return words.filter(word => {
		const lemmaId = word.lemmaId ?? word.id;

		if (seenLemmaIds.has(lemmaId)) {
			return false;
		}

		seenLemmaIds.add(lemmaId);
		return true;
	});
}

export default async function getDeck({
	deck,
	amount = 12,
	userId,
}: GetDeckProps): Promise<CardDeck | undefined> {
	/**
	 * We need placeholder quest markers (?s)
	 */
	const placeholders = deck.wordIds.map(() => '?').join(',');

	/**
	 * Get the DB
	 * Select all the words in that deck (deck.wordIds)
	 * The word raffle happens after this query.
	 * We need all of the possible words here so every word
	 * has a chance to be selected.
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

		const parsedRows = rows?.map(parseWordRow) ?? [];
		const words = parsedRows.map(({ word }) => word);
		const seenCountByWordId = new Map(
			parsedRows.map(({ seenCount, word }) => [word.id, seenCount]),
		);

		/**
		 * Draw the cards.
		 * Word progress adds a slight bias and rarity still affects the chance.
		 */
		const selectedWords = wordRaffle(dedupeByLemma(words), amount, word => {
			return getDeckWordProgressSelectionWeight({
				correctCount: word.correctCount,
				seenCount: seenCountByWordId.get(word.id) ?? 0,
			});
		});

		/**
		 * Return the deck
		 */
		return {
			...deck,
			words: selectedWords,
			wordChoices: await getDeckWordChoices({ wordIds: deck.wordIds }),
		};
	} catch (error) {
		console.error('Could not retrieve deck:', error);
	}
}
