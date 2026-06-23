import { getDB } from '../connection';
import { getWordRankSqlCountSelect, WordRankKey } from '../../util/wordRanks';

export type DeckRankCounts = Record<WordRankKey, number>;

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
	const rankCountSelect = getWordRankSqlCountSelect('uw.correctCount');

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
