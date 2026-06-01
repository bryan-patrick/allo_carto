import { getDB } from '../interface';

/**
 * Increments the correct count row on the userWords table
 */
export async function incrementSeenCount(userId: string, wordId: string) {
	const database = await getDB();

	await database.runAsync(
		`
		INSERT INTO userWords (
			userId,
			wordId,
			seenCount
		)
		VALUES (?, ?, 1)
		ON CONFLICT(userId, wordId)
		DO UPDATE SET
			seenCount = seenCount + 1;
		`,
		[userId, wordId],
	);
}
