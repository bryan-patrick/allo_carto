import { getDB } from '../connection';

/**
 * Typing
 */
interface GetWordRankProps {
	userId: string;
	wordId: string;
}

/**
 * Get user's score from the join table
 */
export default async function getWordRank({
	userId,
	wordId,
}: GetWordRankProps) {
	const database = await getDB();

	const row: { correctCount: number } | null = await database.getFirstAsync(
		`SELECT correctCount FROM userWords WHERE userId = ? AND wordId = ?`,
		userId,
		wordId,
	);

	return row ?? { correctCount: 0 };
}
