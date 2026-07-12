import { getWordRankSqlCountSelect } from '../../util/wordRanks';
import { getDB } from '../connection';

/**
 * Typing
 */
export interface DeckRankCounts {
	seen: number;
	fnew: number;
	bronze: number;
	silver: number;
	gold: number;
	diamond: number;
}

interface GetDeckRankCountsProps {
	userId: string;
	wordIds: string[];
}

/**
 * Deck rank counts init
 */
export const emptyDeckRankCounts: DeckRankCounts = {
	seen: 0,
	fnew: 0,
	bronze: 0,
	silver: 0,
	gold: 0,
	diamond: 0,
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
	const rankCountSelect = getWordRankSqlCountSelect('uw.correctCount');
	const seenCountSelect = `
		SUM(
			CASE
				WHEN COALESCE(uw.seenCount, 0) > 0
					OR COALESCE(uw.correctCount, 0) > 0
				THEN 1
				ELSE 0
			END
		) AS seen
	`;

	const row = await database.getFirstAsync<DeckRankCounts>(
		`
		SELECT
			${seenCountSelect},
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
