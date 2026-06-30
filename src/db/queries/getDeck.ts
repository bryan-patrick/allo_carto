import type { CardDeck, Word } from '../../components/CardDeck/cardDeckTypes';
import wordRaffle from '../../util/wordRaffle';
import { wordRankDefinitions, type WordRankKey } from '../../util/wordRanks';
import { getDB } from '../connection';
import type { WordRow } from '../types';
import getDeckWordChoices from './getDeckWordChoices';

interface GetDeckProps {
	deck: CardDeck;
	amount?: number;
	rank?: WordRankKey;
	userId: string;
}

function getRankCorrectCountCondition(rankKey: WordRankKey): string {
	const rankIndex = wordRankDefinitions.findIndex(rank => rank.key === rankKey);
	const rank = wordRankDefinitions[rankIndex];
	const nextRank = wordRankDefinitions[rankIndex + 1];
	const normalizedCorrectCount = 'COALESCE(uw.correctCount, 0)';

	if (!rank) {
		// SQL secret speak for "include all cards". It's just a fallback.
		return '1 = 1';
	}

	if (!nextRank) {
		return `${normalizedCorrectCount} >= ${rank.minCorrectCount}`;
	}

	return `${normalizedCorrectCount} >= ${rank.minCorrectCount} AND ${normalizedCorrectCount} < ${nextRank.minCorrectCount}`;
}

function parseWordRow(row: WordRow): Word {
	/**
	 * We have to add back in englishWords and isVulgar
	 * since we have to parse the array and isVulgar is
	 * stored with a numeric value instead of a boolean.
	 */
	return {
		...row,
		englishWords: JSON.parse(row.englishWords),
		isVulgar: Boolean(row.isVulgar),
		correctCount: row.userCorrectCount ?? 0,
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
	amount = 6,
	rank,
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
		const rankCondition =
			rank ? `AND ${getRankCorrectCountCondition(rank)}` : '';
		const rows = await database.getAllAsync<WordRow>(
			`
			SELECT
				w.*,
				COALESCE(uw.correctCount, 0) AS userCorrectCount
			FROM words AS w
			LEFT JOIN userWords AS uw
				ON uw.wordId = w.id
				AND uw.userId = ?
			WHERE w.id IN (${placeholders})
			${rankCondition};
			`,
			userId,
			...deck.wordIds,
		);

		const words = rows?.map(parseWordRow) ?? [];

		/**
		 * Draw the cards.
		 * wordRaffle is for determined rarity
		 */
		const selectedWords = wordRaffle(dedupeByLemma(words), amount);

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
