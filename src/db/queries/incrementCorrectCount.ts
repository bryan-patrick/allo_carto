import { getDB } from '../interface';

/**
 * Increments the correct count row on the userWords table
 */
export async function incrementCorrectCount(userId: string, wordId: string) {
	const database = await getDB();

	await database.runAsync(
		`
		INSERT INTO userWords (
			userId,
			wordId,
			correctCount
		)
		VALUES (?, ?, 1)
		ON CONFLICT(userId, wordId)
		DO UPDATE SET
			correctCount = correctCount + 1;
		`,
		[userId, wordId],
	);
}
