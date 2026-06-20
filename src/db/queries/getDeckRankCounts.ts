import { getDB } from '../connection';

export interface DeckRankCounts {
	fnew: number;
	bronze: number;
	silver: number;
	gold: number;
	diamond: number;
	memorized: number;
}

interface GetDeckRankCountsProps {
	userId: string;
	wordIds: string[];
}

export const emptyDeckRankCounts: DeckRankCounts = {
	fnew: 0,
	bronze: 0,
	silver: 0,
	gold: 0,
	diamond: 0,
	memorized: 0,
};

/**
 * Count every word in a deck by the user's current word rank.
 * Words the user has not seen do not have a userWords row, so the
 * LEFT JOIN uses zero for correctCount (fnew).
 */
export default async function getDeckRankCounts({
	userId,
	wordIds,
}: GetDeckRankCountsProps): Promise<DeckRankCounts> {
	if (wordIds.length === 0) return emptyDeckRankCounts;

	const database = await getDB();
	const quests = wordIds.map(() => '?').join(',');

	const row = await database.getFirstAsync<DeckRankCounts>(
		`
		SELECT
			SUM(CASE WHEN COALESCE(uw.correctCount, 0) < 5 THEN 1 ELSE 0 END) AS fnew,
			SUM(CASE WHEN uw.correctCount BETWEEN 5 AND 14 THEN 1 ELSE 0 END) AS bronze,
			SUM(CASE WHEN uw.correctCount BETWEEN 15 AND 29 THEN 1 ELSE 0 END) AS silver,
			SUM(CASE WHEN uw.correctCount BETWEEN 30 AND 59 THEN 1 ELSE 0 END) AS gold,
			SUM(CASE WHEN uw.correctCount BETWEEN 60 AND 79 THEN 1 ELSE 0 END) AS diamond,
			SUM(CASE WHEN uw.correctCount >= 80 THEN 1 ELSE 0 END) AS memorized
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
