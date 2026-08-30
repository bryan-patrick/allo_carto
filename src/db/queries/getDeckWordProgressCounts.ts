import { getWordProgressSqlCountSelect } from '../../util/wordProgress';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Typing
 */
export interface DeckWordProgressCounts {
	unseen: number;
	new: number;
	learning: number;
	familiar: number;
	known: number;
	mastered: number;
}

interface GetDeckWordProgressCountsProps {
	database: SQLiteDatabase;
	userId: string;
	wordIds: string[];
}

/**
 * Deck word progress counts init
 */
export const emptyDeckWordProgressCounts: DeckWordProgressCounts = {
	unseen: 0,
	new: 0,
	learning: 0,
	familiar: 0,
	known: 0,
	mastered: 0,
};

/**
 * Count every word in a deck by the user's current word progress.
 */
export default async function getDeckWordProgressCounts({
	database,
	userId,
	wordIds,
}: GetDeckWordProgressCountsProps): Promise<DeckWordProgressCounts> {
	if (wordIds.length === 0) return emptyDeckWordProgressCounts;

	const quests = wordIds.map(() => '?').join(',');
	const progressCountSelect = getWordProgressSqlCountSelect('uw.correctCount', 'uw.seenCount');
	const row = await database.getFirstAsync<DeckWordProgressCounts>(
		`
		SELECT
			${progressCountSelect}
		FROM words AS w
		LEFT JOIN userWords AS uw
			ON uw.wordId = w.id
			AND uw.userId = ?
		WHERE w.id IN (${quests});
		`,
		userId,
		...wordIds,
	);

	return row ?? emptyDeckWordProgressCounts;
}
