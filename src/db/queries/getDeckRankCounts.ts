import { getWordRankSqlCountSelect } from '../../util/wordRanks';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Typing
 */
export interface DeckRankCounts {
	unseen: number;
	fnew: number;
	bronze: number;
	silver: number;
	gold: number;
	diamond: number;
}

interface GetDeckRankCountsProps {
	database: SQLiteDatabase;
	userId: string;
	wordIds: string[];
}

/**
 * Deck rank counts init
 */
export const emptyDeckRankCounts: DeckRankCounts = {
	unseen: 0,
	fnew: 0,
	bronze: 0,
	silver: 0,
	gold: 0,
	diamond: 0,
};

/**
 * Count every word in a deck by the user's current word rank
 */
export default async function getDeckRankCounts({
	database,
	userId,
	wordIds,
}: GetDeckRankCountsProps): Promise<DeckRankCounts> {
	if (wordIds.length === 0) return emptyDeckRankCounts;

	const quests = wordIds.map(() => '?').join(',');
	const rankCountSelect = getWordRankSqlCountSelect(
		'uw.correctCount',
		'uw.seenCount',
	);
	const row = await database.getFirstAsync<DeckRankCounts>(
		`
		SELECT
			${rankCountSelect}
		FROM words AS w
		LEFT JOIN userWords AS uw
			ON uw.wordId = w.id
			AND uw.userId = ?
		WHERE w.id IN (${quests});
		`,
		userId,
		...wordIds,
	);

	return row ?? emptyDeckRankCounts;
}
